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

<<<<<<< HEAD
  teacherTest(`https://${env.CMS_PREFIX}.${env.APP_URL}/v1`, data.accessCookie, data.orgID);
=======
  initCookieJar(data.accessCookie)

  teacherLandingTest(data.orgID);
}

function teacherLandingTest(orgID) {

  getContentsFolders(orgID);

  getAssessmentsSummary(orgID);

  getSchedulesTimeView(orgID);
>>>>>>> d60bb60c043b0a2cffad271322d7bb2b6ebbd653
}