import {
  initUserCookieJar
} from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest } from "./landing-test.js";
import { loginSetupB2C } from "../utils/setup.js";
import { defaultRateOptions } from "../utils/common.js";
import { getUserIDForMultiUser as getUserID } from "../utils/common.js";

export const options = defaultRateOptions;

export function setup() {};

export default function main() {

  const userID = getUserID(scenario.iterationInTest);

  const accessCookie = loginSetupB2C(userID);

  initUserCookieJar(accessCookie);

  landingTest();
}