import http from 'k6/http';
import { getOrgID, loginSetupWithUserID } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function checkMultiUserPermissionInOrg(orgID, permissionNames, userID) {
  
  return http.post(userEndpoint, JSON.stringify({
    query: `query checkMultiUserPermissionInOrg($user_id: ID! $organization_id: ID! $permission_name_0: ID! $permission_name_1: ID! $permission_name_2: ID!) {
      user(user_id: $user_id) {
        membership(organization_id: $organization_id) {
          q0: checkAllowed(permission_name: $permission_name_0)
          q1: checkAllowed(permission_name: $permission_name_1)
          q2: checkAllowed(permission_name: $permission_name_2)
        }
      }
    }`,
    operationName: 'checkMultiUserPermissionInOrg',
    variables: {
      organization_id: orgID,
      permission_name_0: permissionNames[0],
      permission_name_1: permissionNames[1],
      permission_name_2: permissionNames[2],
      user_id: userID
     }
    }),{
    headers: APIHeaders
  });
};

export function setup() {

  const loginData = loginSetupWithUserID();
  const orgID = getOrgID(loginData.cookie);

  return {
    accessCookie:    loginData.cookie,
    orgID:           orgID,
    userID:          loginData.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = checkMultiUserPermissionInOrg(
    data.orgID, 
    ENV_DATA.permissionNames,
    data.userID
  );
  isRequestSuccessful(response);
};