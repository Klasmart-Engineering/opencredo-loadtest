import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query($user_id: ID!) {
  user(user_id: $user_id) {
    memberships{
      organization{
        id:organization_id
        name:organization_name
        status
      }
    }
  }
}`;

export function getOrgByUser(userEndpoint, userID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getOrgByUser',
    variables: {
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const userID = ENV_DATA.userID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID: userID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getOrgByUser(data.userEndpoint, data.userID, data.accessCookie, singleTest)
}