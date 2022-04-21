import {
  defaultSetup,
  initCookieJar
} from './common.js';
import { defaultRateOptions }       from '../utils/common.js';
import { getAssessmentsForStudent } from './endpoints/assessments-for-students.js';
import { getAssessmentsSummary }    from './endpoints/assessments-summary.js';
import { getSchedulesTimeView }     from './endpoints/schedules-time-view.js';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof cms-backend
 * @alias landingStudentOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the landing student CMS test
 *
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias landingStudentSetup
 */
export function setup() {

  return defaultSetup();
}

/**
 * function for k6 to run the landing student CMS test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias landingStudentMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  studentLandingTest(data.orgID);
}

/**
 * function to run a landing student test, imports individual endpoint functions
 *
 * @param {string} orgID - organization ID to pass to the endpoint
 * @returns {void} Nothing
 * @memberof cms-backend
 */
function studentLandingTest(orgID) {

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);

  getAssessmentsForStudent(orgID);
}