import http from 'k6/http';
import { scenario } from 'k6/execution';
import { defaultRateOptions, getB2CTokenPool, getCurrentUserFromPool, isRequestSuccessful } from '../utils/common.js';
import {
  APIHeaders,
  AuthEndpoint,
} from './common.js'

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m'
});

export function setup() {
  
  const tokenPool = getB2CTokenPool();

  return {
    tokenPool: tokenPool
  }
}

export default function main(data) {

  const id = getCurrentUserFromPool(scenario.iterationInTest);

  const userData = data.tokenPool[id];

  let response;

  //initialise the cookies for this VU
  http.cookieJar();

  const authHeader = {
    Authorization: `Bearer ${userData.access_token}`
  };

  response = http.post(`${AuthEndpoint}/transfer`, '', {
    headers: Object.assign(APIHeaders, authHeader),
  });
  isRequestSuccessful(response);
  
  const switchPayload = JSON.stringify({
    user_id: userData.user_id
  })
  
  response = http.post(`${AuthEndpoint}/switch`, switchPayload, {
    headers: APIHeaders
  });
  isRequestSuccessful(response);

  response = http.get(`${AuthEndpoint}/refresh`, {
    headers: APIHeaders,
  });
  isRequestSuccessful(response);
}