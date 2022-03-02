import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { getOrgID } from '../../../utils/setup.js';
import { userEndpoint } from "../../common.js";
import { checkMultiUserPermissionInOrg } from "./usrsvc_01_checkMultiUserPermissionsInOrg.js";

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = true;
  const userPool = getUserPool(returnUserIDs);

  const orgID = getOrgID(userPool[0].cookie);

  return {
    userPool: userPool,
    orgID: orgID,
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(userEndpoint, data.userPool[user].cookie);

  const response = checkMultiUserPermissionInOrg(
    data.userPool[user].id,
    data.orgID,
    ENV_DATA.permissionNames
  );
  isRequestSuccessful(response);
  
  return response;
};