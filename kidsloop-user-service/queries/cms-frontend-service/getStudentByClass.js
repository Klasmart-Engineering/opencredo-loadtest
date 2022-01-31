import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query ($class_id: ID!){
  class(class_id: $class_id){
    students{
      id: user_id
      name: user_name
    }
  }
}`;

export function getStudentByClass(userEndpoint, classID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getStudentByClass',
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

  return getStudentByClass(data.userEndpoint, data.classID, data.accessCookie, singleTest)
}