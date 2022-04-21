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
 * @alias assessmentsForStudentOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the assessments for student endpoint test
 * 
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias assessmentsForStudentSetup
 */
export function setup() {

  return defaultSetup();
}

/**
 * function for k6 to run the assessments for student endpoint test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias assessmentsForStudentMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  getAssessmentsForStudent(data.orgID);
}

/**
 * function to check the assessments for student endpoint, exported to be consumed in multi endpoint tests
 * cookie jar must be initalised before calling
 *
 * @param {string} orgID - an organization ID
 * @returns {object} a k6/http response object
 * @memberof cms-backend
 */
export function getAssessmentsForStudent(orgID) {

  const response = http.get(`${CMSEndpoint}/assessments_for_student?complete_at_ge=1640252069&complete_at_le=1641461669&order_by=-complete_at&org_id=${orgID}&page=1&page_size=5&type=home_fun_study`, {
    headers: APIHeaders
  });

  isRequestSuccessful(response);
  
  return response;
}