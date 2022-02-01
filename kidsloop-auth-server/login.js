import { amsLogin, getUserID } from '../utils/setup.js'
import { loginTest } from './functions.js'

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
  }
}

const APP_URL = __ENV.APP_URL

export function setup() {

  const token = amsLogin();

  const userID = getUserID(token);

  return {
    token: token,
    userID: userID
  };
}

export default function main(data) {

  const authURL = `https://auth.${APP_URL}`;

  loginTest(authURL, data.token, data.userID);
}