import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getAssessmentDetails } from '../assessment-details.js';

export const options = defaultRateOptions;

const assessmentID = __ENV.assessmentID ? __ENV.assessmentID : '61fbf0fb53e200b6fe53a117';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getAssessmentDetails(data.orgID, assessmentID);

  return response;
};