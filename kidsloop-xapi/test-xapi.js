import { scenario } from 'k6/execution';
import { xapiTest } from './functions.js'
import * as dev from "../utils/env.js";
import {
  defaultRateOptions,
  getUserPool,
  getCurrentUserFromPool,
  initCookieJar,
  isRequestSuccessful
} from "../utils/common.js";

export const xapiEndpoint = dev.APP_URL_TEST ? `https://api.${dev.APP_URL_TEST}/xapi/graphql` : `https://api.${dev.APP_URL}/xapi/graphql`;
export const options = defaultRateOptions

export function setup() {
  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  console.log(xapiEndpoint)

  return {
    userPool: userPool,
  };
};

export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);
  initCookieJar(xapiEndpoint, data.userPool[user]);

  const response = xapiTest(xapiEndpoint);
  isRequestSuccessful(response);
  return response;
}