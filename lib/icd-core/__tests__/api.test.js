const { describe, it } = require('node:test');
const assert = require('assert');
const encodeHandler = require('../../../api/encode');
const searchHandler = require('../../../api/search');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(payload) {
      this.body = payload;
    }
  };
}

function createMockReq(method, body) {
  return { method, body };
}

function parseResponse(res) {
  return JSON.parse(res.body);
}

async function callHandler(handler, method, body) {
  const req = createMockReq(method, body);
  const res = createMockRes();
  await handler(req, res);
  return parseResponse(res);
}

async function expectEncode(text, expectedCodes) {
  const response = await callHandler(encodeHandler, 'POST', { text });
  assert.strictEqual(response.ok, true, 'Encode endpoint should return ok');
  assert.strictEqual(response.data.text, text);
  assert.deepStrictEqual(
    response.data.codes.map((c) => c.code),
    expectedCodes,
    `${text} should map to ${expectedCodes.join(', ')}`
  );
}

describe('API encode endpoint', () => {
  it('encodes Type 2 diabetes with CKD stage 4', async () => {
    await expectEncode('Type 2 diabetes with CKD stage 4', ['E11.22', 'N18.4']);
  });

  it('encodes hypertensive heart and CKD with heart failure', async () => {
    await expectEncode(
      'Hypertensive heart and chronic kidney disease with heart failure',
      ['I13.0', 'I50.9', 'N18.9']
    );
  });

  it('encodes COPD with acute exacerbation', async () => {
    await expectEncode('COPD with acute exacerbation', ['J44.1']);
  });

  it('encodes secondary liver cancer from colon', async () => {
    await expectEncode('Secondary liver cancer from colon', ['C78.7', 'C18.9']);
  });

  it('encodes major depressive disorder recurrent severe without psychosis', async () => {
    await expectEncode(
      'Major depressive disorder recurrent severe without psychotic features',
      ['F33.2']
    );
  });
});

describe('API search endpoint', () => {
  it('returns matches for COPD search', async () => {
    const response = await callHandler(searchHandler, 'POST', { q: 'copd' });
    assert.strictEqual(response.ok, true);
    assert.ok(response.data.results.length > 0, 'should return at least one result');
    assert.strictEqual(response.data.results[0].key.includes('copd'), true);
  });

  it('enforces required query parameter', async () => {
    const res = createMockRes();
    await searchHandler(createMockReq('POST', {}), res);
    const parsed = parseResponse(res);
    assert.strictEqual(parsed.ok, false);
    assert.strictEqual(parsed.error.message.includes('Missing required "q"'), true);
  });
});
