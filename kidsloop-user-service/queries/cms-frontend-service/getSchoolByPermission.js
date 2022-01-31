import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query(
  $user_id: ID!
  $permission_name: String!
) {
  user(user_id: $user_id) {
    schoolsWithPermission(permission_name: $permission_name) {
      school {
        school_id
        school_name
        status
        organization {
          organization_id
        }
      }
    }
  }
}`;

export function getSchoolByPermission(userEndpoint, userID, permissionName, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSchoolByPermission',
    variables: {
      user_id: userID,
      permission_name: permissionName
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const userID = ENV_DATA.userID;
  const permissionName = ENV_DATA.permissionNames[0]

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
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

  return getSchoolByPermission(data.userEndpoint, data.userID, data.permissionName, data.accessCookie, singleTest)
}