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
 * @alias assessmentsSummaryOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the assessments summary endpoint test
 * 
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias assessmentsSummarySetup
 */
export function setup() {

  return defaultSetup();
}

/**
 * function for k6 to run the assessments summary endpoint test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias assessmentsSummaryMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  getAssessmentsSummary(data.orgID);
}

/**
 * function to check the assessments summary endpoint, exported to be consumed in multi endpoint tests
 * cookie jar must be initalised before calling
 *
 * @param {string} orgID - an organization ID
 * @returns {object} a k6/http response object
 * @memberof cms-backend
 */
export function getAssessmentsSummary(orgID) {

  const response = http.get(`${CMSEndpoint}/assessments_summary?org_id=${orgID}`, {
    headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
}