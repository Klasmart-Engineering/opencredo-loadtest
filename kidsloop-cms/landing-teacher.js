import {
  defaultOptions,
  defaultSetup,
  initCookieJar
} from './common.js';
import { getContentsFolders } from './endpoints/contents-folders.js';
import { getAssessmentsSummary } from './endpoints/assessments-summary.js';
import { getSchedulesTimeView } from './endpoints/schedules-time-view.js';

export const options = defaultOptions;

export function setup() {

  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie)

  teacherLandingTest(data.orgID);
}

function teacherLandingTest(orgID) {

  getContentsFolders(orgID);

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);
}