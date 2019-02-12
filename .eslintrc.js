module.exports = {
  "parser": "babel-eslint",
  'parserOptions': {
    'ecmaVersion': 7,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true,
    }
  },
  "env": {
    "amd": true,
    "browser": true
  },
  'extends': [
    'eslint:recommended'
  ],
  'rules': {
    'max-len': [2, 125, 4, {ignoreComments: true, ignoreUrls: true}],
    'new-cap': ['error', { 'capIsNew': false }],
    'semi': ['error', 'never']
  }
}