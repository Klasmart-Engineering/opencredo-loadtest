import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getContentsResourcesDownload } from '../contents-resources-download.js';

export const options = defaultRateOptions;

//default resource ID refers to a single resource in testing org in loadtest-k8s environment 
const resourceID = __ENV.resourceID ? __ENV.resourceID : 'assets-61eee3da7a6bce688b2bdf9a.jpeg';


export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getContentsResourcesDownload(data.orgID, resourceID);

  return response;
};