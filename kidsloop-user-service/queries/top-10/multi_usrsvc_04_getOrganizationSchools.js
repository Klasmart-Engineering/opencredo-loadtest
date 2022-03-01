import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { userEndpoint } from "../../common.js";
import { getSchoolsConnection } from './usrsvc_04_getOrganizationSchools.js';

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

  const response = getSchoolsConnection();
  isRequestSuccessful(response);

  return response;
};