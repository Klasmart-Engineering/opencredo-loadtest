import http from 'k6/http';
import { defaultRateOptions, isRequestSuccessful } from '../../utils/common.js';
import {
  APIHeaders,
  CMSEndpoint,
  defaultSetup,
  initCookieJar
} from '../common.js';

/**
 * options for k6, set to default rate options
 * 
 * @constant
 * @type {object}
 * @memberof cms-backend
 * @alias contentsFoldersOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the contents folders endpoint test
 * 
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias contentsFoldersSetup
 */
export function setup() {

  return defaultSetup();
}

/**
 * function for k6 to run the contents folders endpoint test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias contentsFoldersMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  getContentsFolders(data.orgID);
}

/**
 * function to check the contents folders endpoint, exported to be consumed in multi endpoint tests
 * cookie jar must be initalised before calling
 *
 * @param {string} orgID - an organization ID
 * @returns {object} a k6/http response object
 * @memberof cms-backend
 */
export function getContentsFolders(orgID) {

  const response = http.get(`${CMSEndpoint}/contents_folders?order_by=-create_at&org_id=${orgID}&publish_status=published`, {
    headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
}