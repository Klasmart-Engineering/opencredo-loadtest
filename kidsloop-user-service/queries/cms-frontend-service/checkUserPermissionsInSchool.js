import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query(
  $user_id: ID!
  $school_id: ID!
  $permission_name: ID!
) {
  user(user_id: $user_id) {
    school_membership(school_id: $school_id) {
      checkAllowed(permission_name: $permission_name)
    }
  }
}`;

export function checkUserPermissionsInSchool(userEndpoint, userID, schoolID, permissionName, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  }

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'checkUserPermissionsInSchool',
    variables: {
      userID: userID,
      schoolID: schoolID,
      permissionNames: permissionNames
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const userID = ENV_DATA.userID;
  const schoolID = ENV_DATA.schoolID;
  const permissionName = ENV_DATA.permissionNames[0];

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID: userID,
    schoolID: schoolID,
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

  return checkUserPermissionsInSchool(data.userEndpoint, data.userID, data.schoolID, data.permissionName, data.accessCookie, singleTest)
}