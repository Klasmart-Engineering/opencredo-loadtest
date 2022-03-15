import { scenario } from 'k6/execution';
import {
  defaultPoolSetup,
  initCookieJar
} from './common.js';
import { getAssessmentsSummary } from './endpoints/assessments-summary.js';
import { getSchedulesTimeView } from './endpoints/schedules-time-view.js';
import { getAssessmentsForStudent } from './endpoints/assessments-for-students.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../utils/common.js';

export const options = defaultRateOptions;

export function setup() {

  return defaultPoolSetup();
}

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);
  
  studentLandingTest(data.orgID);
}

function studentLandingTest(orgID) {

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);

  getAssessmentsForStudent(orgID);
}