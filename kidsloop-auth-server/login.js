import { amsLogin, GetUserID } from '../utils/setup.js'
import { loginTest } from './functions.js'
import * as env from '../utils/env.js'

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
  }
}

export function setup() {

  const token = amsLogin();

  const userID = GetUserID(token);

  return {
    token: token,
    userID: userID
  };
}

export default function main(data) {

  const authURL = `https://auth.${env.APP_URL}`;

  loginTest(authURL, data.token, data.userID);
}