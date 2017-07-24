import queryString from 'query-string';

export function getQueryFromParams(prop) {
  const params = queryString.parse(location.search);
  return params[prop] !== undefined ? params[prop] : false;
}
