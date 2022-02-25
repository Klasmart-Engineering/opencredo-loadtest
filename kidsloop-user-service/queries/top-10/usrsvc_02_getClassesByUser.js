import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';

export const options = defaultRateOptions;

export function getClassesByUser(userEndpoint, userID) {
  return http.post(userEndpoint, JSON.stringify({
    query: `query getClassesByUser($user_id: ID!) {
      user(user_id: $user_id) {
        classesTeaching {class_id}
        classesStudying {class_id}
      }
    }`,
    operationName: 'getClassesByUser',
    variables: {
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const loginData = loginSetupWithUserID();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID:       loginData.id,
    accessCookie: loginData.cookie,
    singleTest:   true
  };
}

export default function main(data) {
  const response = getClassesByUser(
    data.userEndpoint, 
    data.userID
    );
  isRequestSuccessful(response);
  return response;
}