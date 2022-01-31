import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query ($school_id_0: ID! $school_id_1: ID! $school_id_2: ID!) {
  q0: school(school_id: $school_id_0) {classes{teachers{id:user_id name:user_name}}}
  q1: school(school_id: $school_id_1) {classes{teachers{id:user_id name:user_name}}}
  q2: school(school_id: $school_id_2) {classes{teachers{id:user_id name:user_name}}}
}`;

export function batchGetClassesByUser(userEndpoint, schoolIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'batchGetClassesByUser',
    variables: {
      school_id_0: schoolIDs[0],
      school_id_1: schoolIDs[1],
      school_id_2: schoolIDs[2]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const schoolIDs = ENV_DATA.schoolIDs;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    schoolIDs: schoolIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return batchGetClassesByUser(data.userEndpoint, data.schoolIDs, data.accessCookie, singleTest)
}