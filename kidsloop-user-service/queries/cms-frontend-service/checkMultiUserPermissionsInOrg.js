import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query($user_id: ID! $organization_id: ID! $permission_name_0: ID! $permission_name_1: ID! $permission_name_2: ID!) {
  user(user_id: $user_id) {membership(organization_id: $organization_id) {
      q0: checkAllowed(permission_name: $permission_name_0)
      q1: checkAllowed(permission_name: $permission_name_1)
      q2: checkAllowed(permission_name: $permission_name_2)
    }
  }
}`;

export function checkMultiUserPermissionInOrg(userEndpoint, userID, orgID, permissionNames, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'checkMultiUserPermissionInOrg',
    variables: {
      user_id: userID,
      organization_id: orgID,
      permission_name_0: permissionNames[0],
      permission_name_1: permissionNames[1],
      permission_name_2: permissionNames[2]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const orgID = ENV_DATA.orgID;

  const userID = ENV_DATA.userID;

  const permissionNames = ['', '', '']; //TODO: Obtain list of permissions from somewhere

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID: userID,
    orgID: orgID,
    permissionNames: permissionNames,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return checkMultiUserPermissionInOrg(data.userEndpoint, data.userID, data.orgID, data.permissionNames, data.accessCookie, singleTest)
}