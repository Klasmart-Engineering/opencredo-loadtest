import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($school_id: ID!) {
  q0: school(school_id: $school_id) {
    classes{teachers{id:user_id name:user_name}}
  }
}`;

export function getSchools(userEndpoint, schoolID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSchools',
    variables: {
      school_id: schoolID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const schoolID = ENV_DATA.schoolID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    schoolID: schoolID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getSchools(data.userEndpoint, data.schoolID, data.accessCookie, singleTest)
}