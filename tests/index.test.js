const { handler } = require("../functions/index");
const pick = require("../util/pick");
const { test, expect } = require("@jest/globals");

test("handler returns correct response when no url query parameter is provided", async () => {
  const event = {
    queryStringParameters: {},
  };

  const response = await handler(event);

  expect(response.statusCode).toBe(200);
  expect(response.body).toBe("bandwidth-hero-proxy");
});

test("pick function forwards browser headers correctly", () => {
  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "cookie": "session=abc123",
    "dnt": "1",
    "referer": "https://example.com",
    "host": "should-not-be-picked",
    "authorization": "should-not-be-picked"
  };

  const picked = pick(headers, ["cookie", "dnt", "referer", "user-agent", "accept", "accept-language", "accept-encoding"]);

  expect(picked["user-agent"]).toBe("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  expect(picked["accept"]).toBe("image/webp,image/apng,image/*,*/*;q=0.8");
  expect(picked["accept-language"]).toBe("en-US,en;q=0.9");
  expect(picked["accept-encoding"]).toBe("gzip, deflate, br");
  expect(picked["cookie"]).toBe("session=abc123");
  expect(picked["dnt"]).toBe("1");
  expect(picked["referer"]).toBe("https://example.com");
  expect(picked["host"]).toBeUndefined();
  expect(picked["authorization"]).toBeUndefined();
});
