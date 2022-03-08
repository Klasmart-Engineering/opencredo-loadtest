import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { initUserCookieJar } from "../../common.js";
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

  initUserCookieJar(data.userPool[user].cookie);

  const response = getSchoolByPermission(
    ENV_DATA.permissionNames[0],
    data.userPool[user].id,
  );
  isRequestSuccessful(response);
};