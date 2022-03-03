import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getContentDetails } from '../content-details.js';

export const options = defaultRateOptions;

const contentID = __ENV.contentID ? __ENV.contentID : '61eee3fe1235cc9c6959e69d';

export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getContentDetails(data.orgID, contentID);

  return response;
};