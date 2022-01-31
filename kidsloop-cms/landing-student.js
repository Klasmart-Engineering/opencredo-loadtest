import {
  defaultOptions,
  defaultSetup,
  initCookieJar
} from './common.js';
import { getAssessmentsSummary } from './endpoints/assessments-summary.js';
import { getSchedulesTimeView } from './endpoints/schedules-time-view.js';
import { getAssessmentsForStudent } from './endpoints/assessments-for-students.js';

export const options = defaultOptions;

export function setup() {

  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);
  
  studentLandingTest(data.orgID);
}

function studentLandingTest(orgID) {

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);

  getAssessmentsForStudent(orgID);
}