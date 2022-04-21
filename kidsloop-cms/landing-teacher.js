import {
  defaultSetup,
  initCookieJar
} from './common.js';
import { defaultRateOptions }    from '../utils/common.js';
import { getAssessmentsSummary } from './endpoints/assessments-summary.js';
import { getContentsFolders }    from './endpoints/contents-folders.js';
import { getSchedulesTimeView }  from './endpoints/schedules-time-view.js';
/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof cms-backend
 * @alias landingTeacherOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the landing teacher CMS test
 *
 * @returns {Function} returns the CMS default setup function
 * @memberof cms-backend
 * @alias landingTeacherSetup
 */
export function setup() {

  return defaultSetup();
}

/**
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof cms-backend
 * @alias landingTeacherMain
 */
export default function main(data) {

  initCookieJar(data.accessCookie);

  teacherLandingTest(data.orgID);
}

/**
 * function to run a landing teacher CMS test, imports individual endpoint functions
 *
 * @param {string} orgID - organization ID to pass to the endpoint
 * @returns {void} Nothing
 * @memberof cms-backend
 */
function teacherLandingTest(orgID) {

  getContentsFolders(orgID);

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);
}