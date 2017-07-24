const constants = require('./internals/constants');
require('dotenv').config();

const cssFile = `${constants.CSS_FILENAME}.css`;
const jsFile = `${constants.JS_FILENAME}.js`;

module.exports = {
  baseUrl: process.env.PUBLIC_URL,
  meta: {
    title: 'Component ARKit Web',
    description: '',
    keywords: ''
  },
  cssFile,
  jsFile
};
