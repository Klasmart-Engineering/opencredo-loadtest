import { scenario } from 'k6/execution';
import * as env from '../utils/env.js';
import { scoreByUser } from './functions.js'
import {
  defaultRateOptions,
  getUserPool,
  getCurrentUserFromPool,
  initCookieJar,
} from '../utils/common.js';
import {
  APIHeaders,
  assessmentEndpoint,
} from './common.js';

export const options = defaultRateOptions;

export function setup() {
  const userPool = getUserPool();

  return {
    userPool: userPool
  }
}

export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(assessmentEndpoint, data.userPool[user]);
  scoreByUser();
}