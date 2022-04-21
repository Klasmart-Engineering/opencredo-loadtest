import http                                  from 'k6/http';
import { APIHeaders, isRequestSuccessful }   from '../utils/common.js';
import { loginSetup }                        from '../utils/setup.js';
import { defaultRateOptions, initCookieJar } from '../utils/common.js';
import * as env                              from '../utils/env.js';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof pdf-service
 * @alias getPagesOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the get pages test
 *
 * @returns {Function} returns the default setup function
 * @memberof pdf-service
 * @alias getPagesSetup
 */
export function setup() {
  return loginSetup();
}

/**
 * function for k6 to run the get pages test
 *
 * @param {object} data -result of setup function above
 * @memberof pdf-service
 * @alias getPagesMain
 */
export default function main(data) {
  initCookieJar(data);
  getPagesTest();
}

/**
 * the API endpoint for the PDF service
 *
 * @constant
 * @type {string}
 * @memberof pdf-service
 */
const pdfEndpoint = `https://api.${env.APP_URL}/pdf`;

/**
 * the filename of an existing PDF to test against
 *
 * @constant
 * @type {string}
 * @memberof pdf-service
 */
const pdfFileName = '61f7ce22ee9e045916473c5c.pdf';

/**
 * function to hit the get pages endpoint based on the variables set above
 *
 * @returns {void} Nothing
 * @memberof pdf-service
 */
function getPagesTest() {

  const response = http.get(`${pdfEndpoint}/${pdfFileName}/page/1`, {
    headers: APIHeaders
  });
  isRequestSuccessful(response, 200);
}