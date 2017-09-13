const constants = require('./internals/constants');
require('dotenv').config();

const jsFile = `${constants.JS_FILENAME}.js`;

module.exports = {
  baseUrl: process.env.PUBLIC_URL || '',
  meta: {
    title: 'ARKit Web',
    description: '',
    keywords: ''
  },
  jsFile
};
