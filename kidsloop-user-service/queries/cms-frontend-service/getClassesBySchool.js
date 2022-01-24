import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($school_id: ID!) {
  q0: school(school_id: $school_id) {
    classes{id: class_id name: class_name status}
  }
}`;

export function getClassesBySchool(userEndpoint, schoolID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClassesBySchools',
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

  return getClassesBySchool(data.userEndpoint, data.schoolID, data.accessCookie, singleTest)
}