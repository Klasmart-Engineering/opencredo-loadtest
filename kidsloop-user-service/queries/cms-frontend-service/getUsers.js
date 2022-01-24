import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($user_id_0: ID! $user_id_1: ID! $user_id_2: ID! $user_id_3: ID! $user_id_4: ID! $user_id_5: ID!) {
  q0: user(user_id: $user_id_0) {id:user_id name:user_name given_name family_name email avatar}
  q1: user(user_id: $user_id_1) {id:user_id name:user_name given_name family_name email avatar}
  q2: user(user_id: $user_id_2) {id:user_id name:user_name given_name family_name email avatar}
  q3: user(user_id: $user_id_3) {id:user_id name:user_name given_name family_name email avatar}
  q4: user(user_id: $user_id_4) {id:user_id name:user_name given_name family_name email avatar}
  q5: user(user_id: $user_id_5) {id:user_id name:user_name given_name family_name email avatar}
}`;

export function getUsers(userEndpoint, userIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getUsers',
    variables: {
      user_id_0: userIDs[0],
      user_id_1: userIDs[1],
      user_id_2: userIDs[2],
      user_id_3: userIDs[3],
      user_id_4: userIDs[4],
      user_id_5: userIDs[5]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const userIDs = ENV_DATA.userIDs;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userIDs: userIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getUsers(data.userEndpoint, data.userIDs, data.accessCookie, singleTest)
}