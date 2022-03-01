import {
  initCookieJar
} from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest } from "./landing-test.js";
import { defaultRateOptions, getUserPool } from "../utils/common.js";
import * as env from "../utils/env.js";

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '30m'
});

export function setup() {
  
  return getUserPool();
};

const getCurrentUser = (num) => {

  const userPoolCount = env.vus < env.poolCap ? env.vus : env.poolCap;

  const value = num % userPoolCount;
  
  if ((value - 1) < 0 ) {
    return userPoolCount - 1;
  }

  return value - 1;
};

export default function main(data) {

  const id = getCurrentUser(scenario.iterationInTest);

  const accessCookie = data[id];

  initCookieJar(accessCookie);

  landingTest();
}