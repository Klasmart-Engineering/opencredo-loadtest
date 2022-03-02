import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { userEndpoint } from "../../common.js";
import { getSchoolByPermission } from './usrsvc_03_getSchoolByPermission.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = true; 
  const userPool = getUserPool(returnUserIDs);

  return {
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(userEndpoint, data.userPool[user].cookie);

  const response = getSchoolByPermission(
    data.userPool[user].id,
    ENV_DATA.permissionNames[0]
  );
  isRequestSuccessful(response);
  
  return response;
};