const {
  getTrimmedString,
  methodGuard,
  parseJsonBody,
  sendError,
  sendSuccess
} = require('./_utils');

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

    const query = getTrimmedString(body ?? {}, 'q') || getTrimmedString(req.query ?? {}, 'q');
    if (!query) {
      sendError(res, 400, 'Missing required "q" string in request body.');
      return;
    }

    const limitRaw = body?.limit ?? req.query?.limit;
    const limitNumber = Number.parseInt(limitRaw, 10);
    const limit = Number.isNaN(limitNumber) || limitNumber <= 0 ? 10 : Math.min(limitNumber, 50);

    const { searchDiagnoses } = require('../lib/icd-core');
    const results = searchDiagnoses(query, limit);

    sendSuccess(res, {
      query,
      limit,
      results,
      message: results.length
        ? 'Matching ICD coding scenarios returned.'
        : 'No matching ICD coding scenarios found.'
    });
  } catch (error) {
    sendError(res, 500, 'Unexpected error while handling search request.', { message: error.message });
  }
};
