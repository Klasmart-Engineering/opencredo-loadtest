/**
 * function to return a random value from an array
 *
 * @param {*} a - the key to return a value for
 * @returns {object} key with single value
 * @memberof h5p-library
 */
export function chooseRandom(a) {
  return a[Math.floor(Math.random()*a.length)];
}
