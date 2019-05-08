// https://react-table.js.org/#/custom-sorting
export const tableSorting = (a, b) => { // ugly workaround, override default sort
  if (Date.parse(a)) { // convert date to timestamp
    a = Date.parse(a);
  }
  if (Date.parse(b)) {
    b = Date.parse(b);
  }
  // force null and undefined to the bottom
  a = (a === null || a === undefined) ? -Infinity : a;
  b = (b === null || b === undefined) ? -Infinity : b;
  // force any string values to lowercase
  a = typeof a === 'string' ? a.toLowerCase() : a;
  b = typeof b === 'string' ? b.toLowerCase() : b;
  // Return either 1 or -1 to indicate a sort priority
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
  return 0;
}