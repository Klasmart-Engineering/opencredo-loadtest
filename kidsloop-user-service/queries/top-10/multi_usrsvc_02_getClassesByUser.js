import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { initUserCookieJar } from '../../common.js';
import { getClassesByUser } from './usrsvc_02_getClassesByUser.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = true; 
  const userPool = getUserPool(returnUserIDs);

  return {
    userPool: userPool,
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user].cookie);

  const response = getClassesByUser(data.userPool[user].id);
  isRequestSuccessful(response);
};