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
 * @alias schedulesTimeViewOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the schedules time view endpoint test
 * 
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias schedulesTimeViewSetup
 */
export function setup() {

  return defaultSetup();
}

/**
 * function for k6 to run the schedules time view endpoint test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias schedulesTimeViewMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  getSchedulesTimeView(data.orgID);
}

/**
 * function to check the schedules time view endpoint, exported to be consumed in multi endpoint tests
 * cookie jar must be initalised before calling
 *
 * @param {string} orgID - an organization ID
 * @returns {object} a k6/http response object
 * @memberof cms-backend
 */
export function getSchedulesTimeView(orgID) {

  const response = http.get(`${CMSEndpoint}/schedules_time_view?view_type=year&time_at=0&org_id=${orgID}`, {
    headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}