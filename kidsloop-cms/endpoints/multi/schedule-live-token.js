import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getScheduleLiveToken } from '../schedule-live-token.js';

export const options = defaultRateOptions;

//default schedule ID refers to single schedule in testing org in loadtest-k8s environment 
const scheduleID = __ENV.scheduleID ? __ENV.scheduleID : '61efdf2de07ca5c42f12e99d';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getScheduleLiveToken(data.orgID, scheduleID);

  return response;
};