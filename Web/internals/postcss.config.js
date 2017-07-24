const path = require('path');

const production = process.env.NODE_ENV === 'production';
const frontend = 'src';

module.exports = {
  parser: 'postcss-scss',
  plugins: [
    require('postcss-import')({
      path: [
        path.join(process.cwd(), frontend),
        path.join(process.cwd(), frontend, 'base'),
        path.join(process.cwd(), frontend, 'base', 'vars')
      ]
    }),
    require('postcss-simple-vars')({
      unknown: (node, name, result) =>
        node.warn(result, `Unknown variable ${name}`)
    }),
    require('postcss-nested')({}),
    require('postcss-automath')({}),
    require('autoprefixer')({}),
    production ? require('cssnano')({}) : null
  ]
};
