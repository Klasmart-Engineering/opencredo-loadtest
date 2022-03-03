import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getFoldersItemsDetails } from '../folders-items-details.js';

export const options = defaultRateOptions;

//default folder ID refers to single folder in testing org in loadtest-k8s environment 
const folderID = __ENV.folderID ? __ENV.folderID : '61eee8cf6a93400ab939883c';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getFoldersItemsDetails(data.orgID, folderID);

  return response;
};