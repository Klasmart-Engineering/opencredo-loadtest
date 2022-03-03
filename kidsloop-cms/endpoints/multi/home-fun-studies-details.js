import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getHomeFunStudyDetails } from '../home-fun-studies-details.js';

export const options = defaultRateOptions;

const studyID = __ENV.studyID ? __ENV.studyID : '';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getHomeFunStudyDetails(data.orgID, studyID);

  return response;
};