import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query($program_id: ID!) {
  program(id: $program_id) {
    age_ranges {
      id
      name
      status
      system
    }
  }
}`;

export function getAgeRangesByProgram(userEndpoint, programID, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  }

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getAgeRangesByProgram',
    variables: {
      program_id: programID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const programID = ENV_DATA.programID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    programID: programID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getAgeRangesByProgram(data.userEndpoint, data.programID, data.accessCookie, singleTest)
}