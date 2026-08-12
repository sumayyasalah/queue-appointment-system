const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-at-least-32-characters';
const { app } = require('../server');

let server;
let baseUrl;

const request = (path) => new Promise((resolve, reject) => {
  http.get(`${baseUrl}${path}`, (response) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(body) }));
  }).on('error', reject);
});

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint reports an unavailable database before a connection is opened', async () => {
  const response = await request('/health');
  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: 'unavailable', database: 'disconnected' });
});

test('protected endpoints reject requests with no token', async () => {
  const response = await request('/api/users/doctors');
  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authorization token missing');
});

test('unknown routes return a JSON 404 response', async () => {
  const response = await request('/not-a-route');
  assert.equal(response.status, 404);
  assert.match(response.body.message, /Not Found/);
});
