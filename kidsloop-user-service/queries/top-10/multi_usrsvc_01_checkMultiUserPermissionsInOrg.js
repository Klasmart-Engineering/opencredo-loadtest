import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { getOrgID } from '../../../utils/setup.js';
import { initUserCookieJar } from "../../common.js";
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

  initUserCookieJar(data.userPool[user].cookie);

  const response = checkMultiUserPermissionInOrg(
    data.orgID,
    ENV_DATA.permissionNames,
    data.userPool[user].id
  );
  isRequestSuccessful(response);
};