const pick = require("../util/pick");
const fetch = require("node-fetch");
const shouldCompress = require("../util/shouldCompress");
const compress = require("../util/compress");

const DEFAULT_QUALITY = 40;

function firstValue(value) {
  if (Array.isArray(value)) {
    return value[value.length - 1];
  }
  return value;
}

function normalizeUrl(rawUrl) {
  let value = firstValue(rawUrl);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      value = parsed;
    } catch (_) {
      // keep original value when JSON.parse fails
    }
  }

  if (Array.isArray(value)) {
    value = value.join("&url=");
  }

  if (typeof value !== "string") {
    value = value != null ? String(value) : "";
  }

  return value.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, "http://");
}

function getClientIp(req) {
  const forwardedFor = firstValue(req.headers?.["x-forwarded-for"]);
  if (forwardedFor) {
    return forwardedFor;
  }
  const realIp = firstValue(req.headers?.["x-real-ip"]);
  if (realIp) {
    return realIp;
  }
  return req.socket?.remoteAddress || "";
}

function headersToObject(headers) {
  const result = {};
  if (headers && typeof headers.forEach === "function") {
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
  }
  return result;
}

function sendText(res, status, text) {
  const body = text || "";
  res.statusCode = status;
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.setHeader("content-length", Buffer.byteLength(body));
  res.end(body);
}

function sendBuffer(res, buffer, headers = {}) {
  const payload = buffer || Buffer.alloc(0);
  const responseHeaders = {
    ...headers,
    "content-encoding": "identity",
  };

  // ensure content-length matches the payload we're sending
  responseHeaders["content-length"] = payload.length;

  for (const [key, value] of Object.entries(responseHeaders)) {
    if (typeof value !== "undefined" && value !== null) {
      res.setHeader(key, value);
    }
  }

  res.statusCode = 200;
  res.end(payload);
}

async function handler(req, res) {
  const query = req.query || {};
  const rawUrl = query.url;

  if (!rawUrl) {
    return sendText(res, 200, "bandwidth-hero-proxy");
  }

  let targetUrl;
  try {
    targetUrl = normalizeUrl(rawUrl);
  } catch (error) {
    console.error(error);
    return sendText(res, 400, "Invalid URL");
  }

  const useWebp = !firstValue(query.jpeg);
  const grayscale = firstValue(query.bw) != 0;
  const quality = parseInt(firstValue(query.l), 10) || DEFAULT_QUALITY;

  try {
    const upstreamHeaders = pick(req.headers, ["cookie", "dnt", "referer"]);
    const response = await fetch(targetUrl, {
      headers: {
        ...upstreamHeaders,
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": getClientIp(req),
        via: "1.1 bandwidth-hero",
      },
    });

    if (!response.ok) {
      const errorHeaders = headersToObject(response.headers);
      for (const [key, value] of Object.entries(errorHeaders)) {
        res.setHeader(key, value);
      }
      res.statusCode = response.status || 302;
      res.end();
      return;
    }

    const originalHeaders = headersToObject(response.headers);
    const originalBuffer = await response.buffer();
    const contentType = originalHeaders["content-type"] || "";

    if (!shouldCompress(contentType, originalBuffer.length, useWebp)) {
      console.log("Bypassing... Size: ", originalBuffer.length);
      return sendBuffer(res, originalBuffer, originalHeaders);
    }

    const { err, output, headers } = await compress(
      originalBuffer,
      useWebp,
      grayscale,
      quality,
      originalBuffer.length,
    );

    if (err) {
      console.log("Conversion failed: ", targetUrl);
      throw err;
    }

    console.log(`From ${originalBuffer.length}, Saved: ${(originalBuffer.length - output.length) / originalBuffer.length}%`);

    return sendBuffer(res, output, { ...originalHeaders, ...headers });
  } catch (error) {
    console.error(error);
    const message = error?.message || "";
    res.statusCode = 500;
    if (message) {
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.setHeader("content-length", Buffer.byteLength(message));
      res.end(message);
    } else {
      res.end();
    }
  }
}

module.exports = handler;
module.exports.handler = handler;
