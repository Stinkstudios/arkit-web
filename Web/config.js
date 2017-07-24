const fs = require('fs');
const constants = require('./internals/constants');
require('dotenv').config();

const production = process.env.NODE_ENV === 'production';

const getFileName = (dir, filename, ext) => {
  const files = fs.readdirSync(dir);
  let dest;
  files.forEach(file => {
    const fileParts = file.split('.');
    if (fileParts[0] === filename) {
      dest = `${fileParts[0]}.${fileParts[1]}`;
    }
  });
  return `${dest}.${ext}`;
};

const cssFile = production
  ? getFileName(
      `${constants.BUILD}/${constants.ASSETS}/${constants.CSS}`,
      constants.CSS_FILENAME,
      'css'
    )
  : `${constants.CSS_FILENAME}.css`;

const jsFile = production
  ? getFileName(
      `${constants.BUILD}/${constants.ASSETS}/${constants.JS}`,
      constants.JS_FILENAME,
      'js'
    )
  : `${constants.JS_FILENAME}.js`;

module.exports = {
  baseUrl: process.env.PUBLIC_URL,
  meta: {
    title: 'WebGL Sketch',
    description: '',
    keywords: ''
  },
  cssFile,
  jsFile
};
