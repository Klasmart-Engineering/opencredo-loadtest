import { initUserCookieJar } from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest, options as defaultOptions } from "./landing-test.js";
import { getUserPool, getCurrentUserFromPool as getCurrentUser } from "../utils/common.js";

export const options = Object.assign({}, defaultOptions, {
  setupTimeout: '30m'
});

export function setup() {
  return getUserPool();
};

export default function main(data) {

  const id = getCurrentUser(scenario.iterationInTest);

  const accessCookie = data[id];

  initUserCookieJar(accessCookie);

  landingTest();
}