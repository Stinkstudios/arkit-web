const shell = require('shelljs');
const program = require('commander');
const consants = require('./constants');

program.option('-w, --watch', 'Watch', 'Watch and compile').parse(process.argv);

const src = './src/base/main.css';

// In production we build directly to the build/assets/css directory
// in dev we build to the assets directory because it's a symlink
const output = `./${consants.BUILD}/${consants.ASSETS}/${consants.CSS}/${consants.CSS_FILENAME}.css`;
const watch = program.watch !== undefined ? '-w' : '';
const postcss = './internals/postcss.config.js';

const cmd = `postcss ${src} -c ${postcss} ${watch} -o ${output}`;

shell.exec(cmd, code => {
  if (code !== 0) {
    console.log('Postcss: error'); // eslint-disable-line no-console
  }
});
