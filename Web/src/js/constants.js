import UAParser from 'ua-parser-js';

export const DEV = process.env.DEV;

let base = `${process.env.PUBLIC_URL}`;
// Add trailing slash if not present
if (base.substr(-1) !== '/') base += '/';

export const BASE_URL = base;
export const SHOW_STATS = true;

// Platform
const parser = new UAParser();

const ua = parser.getResult();
const os = ua.os;

// OSs
export const IOS_VERSION = os.name === 'iOS' ? os.version : null;
export const IS_IOS = os.name === 'iOS';
