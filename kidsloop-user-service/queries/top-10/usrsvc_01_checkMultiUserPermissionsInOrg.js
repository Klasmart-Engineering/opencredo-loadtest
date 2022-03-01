import http from 'k6/http';
import { getOrgID, loginSetupWithUserID } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, initCookieJar, isRequestSuccessful } from '../../../utils/common.js';
import { userEndpoint } from '../../common.js';

export const options = defaultRateOptions

export function checkMultiUserPermissionInOrg(userID, orgID, permissionNames) {
  
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
      user_id: userID,
      organization_id: orgID,
      permission_name_0: permissionNames[0],
      permission_name_1: permissionNames[1],
      permission_name_2: permissionNames[2]
     }
    }),{
    headers: APIHeaders
  });
};

export function setup() {

  const loginData = loginSetupWithUserID();
  const orgID = getOrgID(loginData.cookie);

  return {
    userID:          loginData.id,
    orgID:           orgID,
    permissionNames: ENV_DATA.permissionNames,
    accessCookie:    loginData.cookie,
  };
};

export default function main(data) {

  initCookieJar(userEndpoint, data.accessCookie);

  const response = checkMultiUserPermissionInOrg(
    data.userID, 
    data.orgID, 
    data.permissionNames,
  );
  isRequestSuccessful(response);

  return response;
};