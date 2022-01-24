import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($grade_id: ID!) {
  q0: grade(id: $grade_id) {id name status system}
}`;

export function getGrades(userEndpoint, gradeID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getGrades',
    variables: {
      grade_id: gradeID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const gradeID = ENV_DATA.gradeID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    gradeID: gradeID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getGrades(data.userEndpoint, data.gradeID, data.accessCookie, singleTest)
}