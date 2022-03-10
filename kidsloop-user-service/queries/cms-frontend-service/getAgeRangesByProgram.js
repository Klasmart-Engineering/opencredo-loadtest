import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($program_id: ID!) {
  program(id: $program_id) {
    age_ranges {
      id
      name
      status
      system
    }
  }
}`;

export function getAgeRangesByProgram() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      program_id: ENV_DATA.programID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getAgeRangesByProgram();
  isRequestSuccessful(response);
}