import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($age_id_0: ID! $age_id_1: ID!) {
  q0: age_range(id: $age_id_0) {id name status system}
  q1: age_range(id: $age_id_1) {id name status system}
 }`;

export function getAges(userEndpoint, headers, ageIDs, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  }

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getAges',
    variables: {
      age_id_0: ageIDs[0],
      age_id_1: ageIDs[1]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const ageIDs = ENV_DATA.ageIDs;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    ageIDs: ageIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getAges(data.userEndpoint, data.ageIDs, data.accessCookie, singleTest)
}