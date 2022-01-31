import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query ($user_id: ID!) {
  q0: user(user_id: $user_id) {
    classesTeaching {id:class_id name:class_name status}
    classesStudying {id:class_id name:class_name status}
  }
}`;

export function getClassesByUser(userEndpoint, userID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClassesByUser',
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

  return getClassesByUser(data.userEndpoint, data.userID, data.accessCookie, singleTest)
}