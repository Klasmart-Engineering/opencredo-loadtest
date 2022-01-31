import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($class_id: ID!) {
  q0: class(class_id: $class_id) {
    schools{id:school_id name:school_name status}
  }
}`;

export function getClasses(userEndpoint, classID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClasses',
    variables: {
      class_id: classID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const classID = ENV_DATA.classID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    classID: classID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getClasses(data.userEndpoint, data.classID, data.accessCookie, singleTest)
}