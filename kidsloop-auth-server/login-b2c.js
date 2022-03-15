import http from 'k6/http';
import { loginToB2C } from '../azure-b2c-auth/functions.js';
import { defaultRateOptions, isRequestSuccessful } from '../utils/common.js';
import { getUserIDB2C } from '../utils/setup.js';
import {
  APIHeaders,
  AuthEndpoint,
  requestOverThreshold,
  threshold
} from './common.js'

export const options = defaultRateOptions;

export function setup() {

  const loginResp = loginToB2C(__ENV.USERNAME);

  const userID = getUserIDB2C(loginResp.json('access_token'));

  return {
    access_token: loginResp.json('access_token'),
    id_token: loginResp.json('id_token'),
    refresh_token: loginResp.json('refresh_token'),
    user_id: userID
  }
}

export default function main(data) {

  let response;

  //initialise the cookies for this VU
  http.cookieJar();

  const authHeader = {
    Authorization: `Bearer ${data.access_token}`
  };

  response = http.post(`${AuthEndpoint}/transfer`, '', {
    headers: Object.assign(APIHeaders, authHeader),
  });

  if (response.timings.duration >= threshold ) {
    requestOverThreshold.add(1);
  };

  isRequestSuccessful(response);
  
  const switchPayload = JSON.stringify({
    user_id: data.user_id
  })
  
  response = http.post(`${AuthEndpoint}/switch`, switchPayload, {
    headers: APIHeaders
  });

  if (response.timings.duration >= threshold ) {
    requestOverThreshold.add(1);
  };

  isRequestSuccessful(response);

  response = http.get(`${AuthEndpoint}/refresh`, {
    headers: APIHeaders,
  });

  if (response.timings.duration >= threshold ) {
    requestOverThreshold.add(1);
  };

  isRequestSuccessful(response);
}