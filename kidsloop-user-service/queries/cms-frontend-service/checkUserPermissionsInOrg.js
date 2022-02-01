import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query(
  $user_id: ID!
  $organization_id: ID!
  $permission_name: ID!
) {
  user(user_id: $user_id) {
    membership(organization_id: $organization_id) {
      checkAllowed(permission_name: $permission_name)
    }
  }
}`;

export function checkUserPermissionInOrg(userEndpoint, userID, orgID, permissionName, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'checkUserPermissionInOrg',
     variables: {
      user_id: userID,
      organization_id: orgID,
      permission_name: permissionName
     }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const orgID = ENV_DATA.orgID;
  const userID = ENV_DATA.userID;
  const permissionName = ENV_DATA.permissionNames[0];

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    userID: userID,
    permissionName: permissionName,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return checkUserPermissionInOrg(data.userEndpoint, data.userID, data.orgID, data.permissionName, data.accessCookie, singleTest)
}