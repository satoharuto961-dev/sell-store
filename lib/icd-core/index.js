const { diagnoses, matchDiagnosis } = require('./data');

function encodeDiagnosis(text) {
  const entry = matchDiagnosis(text);
  if (!entry) {
    return {
      text,
      codes: [],
      message: 'No matching ICD rule found for the provided text.'
    };
  }

  return {
    text,
    codes: entry.codes,
    message: 'Codes follow published ICD-10-CM sequencing guidance for this scenario.'
  };
}

function searchDiagnoses(query, limit = 10) {
  const normalized = query.trim().toLowerCase();
  const matches = diagnoses.filter((entry) =>
    entry.key.includes(normalized) || entry.patterns.some((pattern) => pattern.includes(normalized))
  );

  return matches.slice(0, limit).map((entry) => ({
    key: entry.key,
    codes: entry.codes
  }));
}

module.exports = {
  encodeDiagnosis,
  searchDiagnoses
};
