import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getContentLiveToken } from '../content-live-token.js';

export const options = defaultRateOptions;

//default content ID refers to a single content item in testing org in loadtest-k8s environment 
const contentID = __ENV.contentID ? __ENV.contentID : '61eadaa60bf0d1dab16aaeb7';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getContentLiveToken(data.orgID, contentID);

  return response;
};