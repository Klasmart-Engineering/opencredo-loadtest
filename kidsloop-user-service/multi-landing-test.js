import {
  initCookieJar
} from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest } from "./landing-test.js";
import { loginSetupB2C } from "../utils/setup.js";
import { defaultRateOptions } from "../utils/common.js";

export const options = defaultRateOptions;

export function setup() {};

const getUserID = (iterationValue) => {

  const baseNumber = 100000;

  let it = iterationValue - 1;

  if (it > 99999) {
    it = it - 99999
  }

  const userID = baseNumber + (it);

  return `loadtestuser${userID}@testdomain.com`
}

export default function main() {

  const userID = getUserID(scenario.iterationInTest);

  const accessCookie = loginSetupB2C(userID);

  initCookieJar(accessCookie);

  landingTest();
}