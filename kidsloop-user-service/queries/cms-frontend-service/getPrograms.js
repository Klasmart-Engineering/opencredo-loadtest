import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query ($program_id_0: ID! $program_id_1: ID!) {
  q0: program(id: $program_id_0) {id name status system}
  q1: program(id: $program_id_1) {id name status system}
}`;

export function getPrograms(userEndpoint, programIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getPrograms',
    variables: {
      program_id_0: programIDs[0],
      program_id_1: programIDs[1]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const programIDs = ENV_DATA.programIDs;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    programIDs: programIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getPrograms(data.userEndpoint, data.programIDs, data.accessCookie, singleTest)
}