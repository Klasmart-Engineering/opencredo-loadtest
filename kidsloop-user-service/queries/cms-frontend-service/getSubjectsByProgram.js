import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query($program_id: ID!) {
  program(id: $program_id) {
    subjects {
      id
      name
      status
      system
    }			
  }
}`;

export function getSubjectsByProgram(userEndpoint, programID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSubjectsByProgram',
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

  return getSubjectsByProgram(data.userEndpoint, data.programID, data.accessCookie, singleTest)
}