const url = require('url');
const {errorResponse} = require("./response");
const {original, resize} = require("./image");

exports.handler = (event) => new Promise((resolve, reject) => {
  const imageBucket = process.env.IMAGE_BUCKET;

  if (!imageBucket) {
    return reject(`Error: Set environment variable IMAGE_BUCKET`);
  }

  const path = event.path.replace(/\/([a-z]_[\w:]+,)*([a-z]_[\w:]+)\//,'/');
  const objectKey = decodeURI(url.parse(path).pathname.replace(/^\/+/g, ''));
  const size = {}
  const match = event.path.match(/\/(([a-z]_[\w:]+,)*([a-z]_[\w:]+))\//)
  if (match && match[1]) {
    match[1].split(',').forEach(pair => {
      const [k, v] = pair.split('_')
      size[k] = v
    })
  }

  if (!size.w && !size.h) {
    return original(imageBucket, objectKey)
      .then(resolve)
      .catch(reject);
  }

  const width = parseInt(size.w);
  const height = parseInt(size.h);

  if ((size.w && isNaN(width)) || (size.h && isNaN(height))) {
    return reject(errorResponse(`width and height parameters must be integer`, 400));
  }

  return resize(imageBucket, objectKey, width, height)
    .then(resolve)
    .catch(reject);
});
