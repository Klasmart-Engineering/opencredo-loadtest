
import { scenario } from 'k6/execution';
import { initUserCookieJar } from '../common.js';
import { defaultRateOptions, getUserPool, getCurrentUserFromPool as getCurrentUser, isRequestSuccessful } from "../../utils/common.js";
import { getProfiles } from "./getProfiles.js";

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '30m'
});

export function setup() {
  
  return getUserPool();
};

export default function main(data) {

  const id = getCurrentUser(scenario.iterationInTest);

  const accessCookie = data[id];
  initUserCookieJar(accessCookie);

  const response = getProfiles();
  isRequestSuccessful(response);
};