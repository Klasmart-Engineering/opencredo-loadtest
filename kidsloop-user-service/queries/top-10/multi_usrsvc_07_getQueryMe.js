import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { userEndpoint } from "../../common.js";
import { getQueryMe } from './usrsvc_07_getQueryMe.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  return {
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(userEndpoint, data.userPool[user]);

  const response = getQueryMe();
  isRequestSuccessful(response);
  
  return response;
};