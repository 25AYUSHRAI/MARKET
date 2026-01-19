// Lightweight validator middleware (avoids external dependency)
function validateProduct(req, res, next) {
  const errors = [];
  const { title, description, price, amount, priceAmount, currency } = req.body || {};

  if (title === undefined || title === null || String(title).trim() === '') {
    errors.push({ msg: 'title is required', param: 'title' });
  } else if (typeof title !== 'string') {
    errors.push({ msg: 'title must be a string', param: 'title' });
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push({ msg: 'description must be a string', param: 'description' });
    } else if (description.length > 2000) {
      errors.push({ msg: 'description too long', param: 'description' });
    }
  }

  const priceValue = price ?? amount ?? priceAmount;
  if (priceValue !== undefined && priceValue !== null && String(priceValue) !== '') {
    const num = Number(priceValue);
    if (Number.isNaN(num) || !isFinite(num)) {
      errors.push({ msg: 'price must be a number', param: 'price' });
    } else if (num < 0) {
      errors.push({ msg: 'price must be >= 0', param: 'price' });
    }
  }

  if (currency !== undefined && currency !== null && currency !== '') {
    if (!['USD', 'INR'].includes(currency)) {
      errors.push({ msg: 'currency must be USD or INR', param: 'currency' });
    }
  }

  if (req.files && req.files.length > 5) {
    errors.push({ msg: 'maximum 5 images allowed', param: 'images' });
  }

  if (errors.length) {
    return res.status(422).json({ errors });
  }

  next();
}

module.exports = { validateProduct };
