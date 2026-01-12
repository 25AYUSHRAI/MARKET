/**
 * Safe Redis client: uses a lightweight in-memory mock when NODE_ENV === 'test'
 * or when no Redis connection info is provided. This prevents tests from
 * connecting to production Redis and avoids unhandled ENOTFOUND errors.
 */
const Redis = require('ioredis');

function cleanEnv(v) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/(^\s*"\s*|\s*"\s*$)/g, '').trim();
}

const REDIS_HOST = cleanEnv(process.env.REDIS_HOST);
const REDIS_PORT = cleanEnv(process.env.REDIS_PORT);
const REDIS_PASSWORD = cleanEnv(process.env.REDIS_PASSWORD);
const REDIS_URL = cleanEnv(process.env.REDIS_URL);
const REDIS_TLS = (process.env.REDIS_TLS || '').toLowerCase() === 'true';

function createMock() {
  const store = new Map();
  const expirations = new Map();

  function now() {
    return Date.now();
  }

  function cleanExpired(key) {
    const exp = expirations.get(key);
    if (exp && now() >= exp) {
      store.delete(key);
      expirations.delete(key);
    }
  }

  return {
    get: async (key) => {
      cleanExpired(key);
      const v = store.get(key);
      return v === undefined ? null : v;
    },

    set: async (key, value, ...args) => {
      store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      if (args && args.length >= 2) {
        const mode = String(args[0]).toUpperCase();
        const ttl = Number(args[1]);
        if ((mode === 'EX' || mode === 'PX') && !Number.isNaN(ttl)) {
          const ms = mode === 'EX' ? ttl * 1000 : ttl;
          expirations.set(key, now() + ms);
        }
      }
      return 'OK';
    },

    del: async (key) => {
      const existed = store.delete(key);
      expirations.delete(key);
      return existed ? 1 : 0;
    },

    hset: async (key, field, value) => {
      cleanExpired(key);
      const raw = store.get(key);
      const obj = raw ? JSON.parse(raw) : {};
      obj[field] = value;
      store.set(key, JSON.stringify(obj));
      return 1;
    },

    hgetall: async (key) => {
      cleanExpired(key);
      const raw = store.get(key);
      return raw ? JSON.parse(raw) : {};
    },

    incr: async (key) => {
      cleanExpired(key);
      const cur = parseInt(store.get(key) || '0', 10) + 1;
      store.set(key, String(cur));
      return cur;
    },

    expire: async (key, seconds) => {
      if (!store.has(key)) return 0;
      expirations.set(key, now() + seconds * 1000);
      return 1;
    },

    on: () => {},
    quit: async () => {},
    disconnect: () => {},
  };
}

let client;

// Use mock for tests or when no host/url provided
if (process.env.NODE_ENV === 'test' || (!REDIS_URL && !REDIS_HOST)) {
  client = createMock();
} else {
  let opts;

  if (REDIS_URL) {
    // rediss:// automatically enables TLS in ioredis
    opts = REDIS_URL;
  } else {
    opts = {
      host: REDIS_HOST,
      port: REDIS_PORT ? Number(REDIS_PORT) : undefined,
      password: REDIS_PASSWORD || undefined,
      lazyConnect: true,
    };

    // TLS ONLY when explicitly requested
    if (REDIS_TLS) {
      opts.tls = {};
    }
  }

  try {
    client = new Redis(opts);

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    client.on('error', (err) => {
      console.error(
        '[ioredis] error:',
        err && err.message ? err.message : err
      );
    });

    // Attempt connection; fallback to mock in non-production
    client.connect().catch((err) => {
      console.error(
        '[ioredis] connect failed:',
        err && err.message ? err.message : err
      );

      if (process.env.NODE_ENV !== 'production') {
        console.warn('[ioredis] falling back to in-memory mock');
        client = createMock();
      }
    });
  } catch (err) {
    console.error(
      '[ioredis] initialization failed:',
      err && err.message ? err.message : err
    );
    client = createMock();
  }
}

module.exports = client;
