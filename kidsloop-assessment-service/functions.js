import http from 'k6/http';
import * as env from '../utils/env.js';
import { APIHeaders, isRequestSuccessful } from '../utils/common.js';
import { assessmentEndpoint, query } from './common.js';

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