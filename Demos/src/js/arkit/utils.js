/**
 * clamp a value between 0 and 1
 * @param  {Number} value
 * @return {Number}
 */
export function clamp(value) {
  return Math.min(Math.max(value, 0.0), 1.0);
}
