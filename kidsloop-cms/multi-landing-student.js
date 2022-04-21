import {
  defaultPoolSetup,
  initCookieJar
} from './common.js';
import {
  defaultRateOptions,
  getCurrentUserFromPool
} from '../utils/common.js';
import { getAssessmentsForStudent } from './endpoints/assessments-for-students.js';
import { getAssessmentsSummary }    from './endpoints/assessments-summary.js';
import { getSchedulesTimeView }     from './endpoints/schedules-time-view.js';
import { scenario }                 from 'k6/execution';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof cms-backend
 * @alias multiLandingStudentOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the landing student CMS test with a user pool
 *
 * @returns {Function} returns the CMS default pool setup function
 * @memberof cms-backend
 * @alias multiLandingStudentSetup
 */
export function setup() {

  return defaultPoolSetup();
}

/**
 * function for k6 to run the landing student CMS test with a user pool
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias multiLandingStudentMain
 */
export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  multiStudentLandingTest(data.orgID);
}

/**
 * function to run a multi user landing student test, imports individual endpoint functions
 *
 * @param {string} orgID - organization ID to pass to the endpoint
 * @returns {void} Nothing
 * @memberof cms-backend
 */
function multiStudentLandingTest(orgID) {

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);

  getAssessmentsForStudent(orgID);
}