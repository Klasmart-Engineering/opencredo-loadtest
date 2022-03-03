import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getMilestoneDetails } from '../milestone-details.js';

export const options = defaultRateOptions;

//default milestone ID refers to single milestone in testing org in loadtest-k8s environment 
const milestoneID = __ENV.milestoneID ? __ENV.milestoneID : '61eed4267a6bce688b2bd2ef';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getMilestoneDetails(data.orgID, milestoneID);

  return response;
};