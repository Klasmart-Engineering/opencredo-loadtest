import { initCookieJar } from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest } from "./landing-test.js";
import { defaultRateOptions, getUserPool, getCurrentUserFromPool as getCurrentUser } from "../utils/common.js";

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '30m'
});

export function setup() {
  
  return getUserPool();
};

export default function main(data) {

  const id = getCurrentUser(scenario.iterationInTest);

  const accessCookie = data[id];

  initCookieJar(accessCookie);

  landingTest();
}