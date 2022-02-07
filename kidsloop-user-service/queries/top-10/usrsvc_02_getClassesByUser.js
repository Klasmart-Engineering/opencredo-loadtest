import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

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
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID:       ENV_DATA.userID,
    accessCookie: loginSetup(),
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