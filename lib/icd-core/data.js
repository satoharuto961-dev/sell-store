const diagnoses = [
  {
    key: 'type 2 diabetes with ckd stage 4',
    patterns: ['type 2 diabetes with ckd stage 4', 'type ii diabetes with ckd stage 4'],
    codes: [
      {
        code: 'E11.22',
        description: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
        guideline: 'Sequence the diabetic manifestation first.'
      },
      {
        code: 'N18.4',
        description: 'Chronic kidney disease, stage 4 (severe)',
        guideline: 'Add stage of CKD after the diabetic code.'
      }
    ]
  },
  {
    key: 'hypertensive heart and ckd with heart failure',
    patterns: [
      'hypertensive heart and chronic kidney disease with heart failure',
      'hypertensive heart and ckd with heart failure'
    ],
    codes: [
      {
        code: 'I13.0',
        description: 'Hypertensive heart and chronic kidney disease with heart failure and with stage 1 through stage 4 chronic kidney disease, or unspecified chronic kidney disease',
        guideline: 'Combination code precedes heart failure and CKD stage codes.'
      },
      {
        code: 'I50.9',
        description: 'Heart failure, unspecified',
        guideline: 'Report additional code for type of heart failure.'
      },
      {
        code: 'N18.9',
        description: 'Chronic kidney disease, unspecified',
        guideline: 'Capture CKD stage after heart failure code.'
      }
    ]
  },
  {
    key: 'copd with acute exacerbation',
    patterns: ['copd with acute exacerbation', 'chronic obstructive pulmonary disease with acute exacerbation'],
    codes: [
      {
        code: 'J44.1',
        description: 'Chronic obstructive pulmonary disease with (acute) exacerbation',
        guideline: 'Single combination code for COPD with exacerbation.'
      }
    ]
  },
  {
    key: 'secondary liver cancer from colon',
    patterns: ['secondary liver cancer from colon', 'metastatic liver cancer from colon'],
    codes: [
      {
        code: 'C78.7',
        description: 'Secondary malignant neoplasm of liver and intrahepatic bile duct',
        guideline: 'Secondary site is sequenced before the primary neoplasm.'
      },
      {
        code: 'C18.9',
        description: 'Malignant neoplasm of colon, unspecified',
        guideline: 'Identify primary malignancy after the secondary site.'
      }
    ]
  },
  {
    key: 'major depressive disorder recurrent severe without psychotic features',
    patterns: ['major depressive disorder recurrent severe without psychotic features'],
    codes: [
      {
        code: 'F33.2',
        description: 'Major depressive disorder, recurrent severe without psychotic features',
        guideline: 'Use the recurrent severe code without psychosis when specified.'
      }
    ]
  }
];

function matchDiagnosis(text) {
  const normalized = text.toLowerCase();
  return diagnoses.find((entry) =>
    entry.patterns.some((pattern) => normalized.includes(pattern))
  );
}

module.exports = {
  diagnoses,
  matchDiagnosis
};
