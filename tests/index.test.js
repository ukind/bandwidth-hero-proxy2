const handler = require("../api/index");
const { test, expect } = require("@jest/globals");

function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
  };

  res.setHeader = (key, value) => {
    res.headers[key.toLowerCase()] = value;
  };

  res.end = (payload) => {
    res.body = payload;
  };

  return res;
}

test("handler returns correct response when no url query parameter is provided", async () => {
  const req = {
    query: {},
    headers: {},
    socket: {},
  };
  const res = createMockResponse();

  await handler(req, res);

  expect(res.statusCode).toBe(200);
  expect(res.body).toBe("bandwidth-hero-proxy");
  expect(res.headers["content-type"]).toContain("text/plain");
});
