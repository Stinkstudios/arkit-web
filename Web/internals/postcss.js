const shell = require('shelljs');
const program = require('commander');
const uuid = require('uuid/v1');
const consants = require('./constants');

const production = process.env.NODE_ENV === 'production';

program.option('-w, --watch', 'Watch', 'Watch and compile').parse(process.argv);

const src = './src/base/main.css';
const filename = production ? `styles.${uuid()}` : 'styles';

// In production we build directly to the build/assets/css directory
// in dev we build to the assets directory because it's a symlink
const output = `./${consants.BUILD}/${consants.ASSETS}/${consants.CSS}/${filename}.css`;
const watch = program.watch !== undefined ? '-w' : '';
const postcss = './internals/postcss.config.js';

const cmd = `postcss ${src} -c ${postcss} ${watch} -o ${output}`;

shell.exec(cmd, code => {
  if (code !== 0) {
    console.log('Postcss: error'); // eslint-disable-line no-console
  }
});
