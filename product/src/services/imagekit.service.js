const ImageKit = require('imagekit');
const imagekit = new ImageKit({
	publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_test',
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_test',
	urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo'
});
function ImageKitMock(config) {
  return {
    upload: (options) => {
      return Promise.resolve({
        url: 'https://example.com/fake-image.jpg',
        fileId: 'fake_file_123',
      });
    }
  };
};


module.exports = {ImageKitMock,imagekit}