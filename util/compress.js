// Compresses an image using Sharp library
const sharp = require("sharp");

function compress(imagePath, useWebp, grayscale, quality, originalSize) {
  let format = useWebp ? "webp" : "jpeg";

  // Enable animated support for GIFs - load all frames
  const sharpOptions = { animated: true, pages: -1 };
  
  const formatOptions = useWebp
    ? {
        quality,
        loop: 0,        // Loop forever
        effort: 4,      // Encoding effort (0-6)
        lossless: false,
      }
    : {
        quality,
        progressive: true,
        optimizeScans: true,
      };

  return sharp(imagePath, sharpOptions)
    .grayscale(grayscale)
    .toFormat(format, formatOptions)
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({
      err: null,
      headers: {
        "content-type": `image/${format}`,
        "content-length": info.size,
        "x-original-size": originalSize,
        "x-bytes-saved": originalSize - info.size,
      },
      output: data,
    }))
    .catch((err) => ({ err }));
}

module.exports = compress;