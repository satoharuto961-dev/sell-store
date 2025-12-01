const {
  getTrimmedString,
  methodGuard,
  parseJsonBody,
  sendError,
  sendSuccess
} = require('./_utils');

const SUPPORTED_ENCODINGS = ['base64', 'uri'];

module.exports = async function handler(req, res) {
  try {
    if (!methodGuard(req, res, ['POST'])) {
      return;
    }

    const body = await parseJsonBody(req).catch((error) => {
      sendError(res, 400, error.message);
      return null;
    });

    if (body === null) {
      return;
    }

    const text = getTrimmedString(body ?? {}, 'text') || getTrimmedString(req.query ?? {}, 'text');
    if (!text) {
      sendError(res, 400, 'Missing required "text" string in request body.');
      return;
    }

    const encoding = getTrimmedString(body ?? {}, 'encoding') || getTrimmedString(req.query ?? {}, 'encoding') || 'base64';

    if (!SUPPORTED_ENCODINGS.includes(encoding)) {
      sendError(res, 400, `Unsupported encoding. Use one of: ${SUPPORTED_ENCODINGS.join(', ')}.`);
      return;
    }

    const { encodeDiagnosis } = require('../lib/icd-core');
    const payload = encodeDiagnosis(text);

    let encoded;
    if (encoding === 'base64') {
      encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    } else {
      encoded = encodeURIComponent(JSON.stringify(payload));
    }

    sendSuccess(res, {
      text,
      encoding,
      encoded,
      codes: payload.codes,
      message: payload.message
    });
  } catch (error) {
    sendError(res, 500, 'Unexpected error while handling encode request.', { message: error.message });
  }
};
