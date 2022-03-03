import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getLearningOutcomeDetails } from '../learning-outcome-details.js';

export const options = defaultRateOptions;

//default outcome ID refers to single outcome in testing org in loadtest-k8s environment
const outcomeID = __ENV.outcomeID ? __ENV.outcomeID : '61eadb950deabad23b938a32';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getLearningOutcomeDetails(data.orgID, outcomeID);

  return response;
};