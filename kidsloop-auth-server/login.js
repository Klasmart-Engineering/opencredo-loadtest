import { amsLogin, GetUserID } from '../utils/setup.js'
import { loginTest } from './functions.js'

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
  }
}

const APP_URL = __ENV.APP_URL
const USERNAME = __ENV.USERNAME

const TESTVAL = __ENV.test

export function setup() {

  const token = amsLogin(USERNAME);

  const userID = GetUserID(APP_URL, token)

  return {
    token: token,
    userID: userID
  };
}

export default function main(data) {

  const authURL = `https://auth.${APP_URL}`;

  loginTest(authURL, data.token, data.userID);
}