import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($age_id_0: ID!, $age_id_1: ID!) {
  q0: age_range(id: $age_id_0) {
    id
    name
    status
    system
  }
  q1: age_range(id: $age_id_1) {
    id
    name
    status
    system
  }
}`;

export function getAges() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      age_id_0: ENV_DATA.ageIDs[0],
      age_id_1: ENV_DATA.ageIDs[1]
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getAges();
  isRequestSuccessful(response);
};