import http from 'k6/http';
import {
  APIHeaders,
  defaultOptions,
  defaultSetup,
  initCookieJar,
  isRequestSuccessful,
  threshold,
  assessmentEndpoint,
  query
} from './common.js';
import * as env from '../utils/env.js';

export const options = defaultOptions;

export function setup() {
  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);
  
  scoreByUser();
}

export function scoreByUser() {

  let response;
  const graphqlEndpoint = `${assessmentEndpoint}graphql`

  response = http.post(graphqlEndpoint, JSON.stringify({
    query: query,
    variables: {
      id: env.ROOM_ID
    }
  }), {
    headers: APIHeaders
  });

  isRequestSuccessful(response);
}