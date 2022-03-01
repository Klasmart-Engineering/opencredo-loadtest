import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { getOrgID } from '../../../utils/setup.js';
import { userEndpoint } from "../../common.js";
import { getTeachersByOrg } from './usrsvc_06_getTeachersByOrg.js';

export const options = defaultRateOptions;

export function setup() {
  
  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  const orgID = getOrgID(userPool[0]);

  return {
    userPool: userPool,
    orgID: orgID,
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(userEndpoint, data.userPool[user]);

  const response = getTeachersByOrg(data.orgID);
  isRequestSuccessful(response);

  return response;
};