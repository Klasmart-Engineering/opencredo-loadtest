import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function getClasses(userEndpoint, classID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: `query getClasses($class_id: ID!) {
      class(class_id: $class_id) {
        schools {
          school_id
        }
      }
    }`,
    operationName: 'getClasses',
    variables: {
      class_id: classID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    classID:      ENV_DATA.classID,
    accessCookie: loginSetup(),
    singleTest:   true
  };
}

export default function main(data) {
  const response = getClasses(
    data.userEndpoint, 
    data.classID, 
    data.accessCookie,
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}