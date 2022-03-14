import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { getOrgID } from '../../../utils/setup.js';
import { initUserCookieJar } from '../../common.js';
import { getTeachersByOrg } from './usrsvc_06_getTeachersByOrg.js';

export const options = defaultRateOptions;

export function setup() {
  
  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  const orgID = getOrgID(userPool[0]);

  return {
    orgID: orgID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getTeachersByOrg(data.orgID);
  isRequestSuccessful(response);
};