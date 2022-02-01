import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA, permissionNames } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function checkMultiUserPermissionInOrg(userEndpoint, userID, orgID, permissionNames, accessCookie = '', singleTest = false) {
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
}

export function setup() {
  return {
    userEndpoint:    `https://api.${env.APP_URL}/user/`,
    userID:          ENV_DATA.userID,
    orgID:           ENV_DATA.orgID,
    permissionNames: ENV_DATA.permissionNames,
    accessCookie:    loginSetup(),
    singleTest:      true
  };
}

export default function main(data) {
  const response = checkMultiUserPermissionInOrg(
    data.userEndpoint, 
    data.userID, 
    data.orgID, 
    data.permissionNames, 
    data.accessCookie, 
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}