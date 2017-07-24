const Stats = require('stats-js');
const stats = new Stats();

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = 10000;

export default stats;
