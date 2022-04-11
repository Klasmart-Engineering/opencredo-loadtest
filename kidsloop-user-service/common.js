import * as env from '../utils/env.js';
import { Counter } from 'k6/metrics';
import {
  APIHeaders as importedHeaders,
  initCookieJar
} from '../utils/common.js';
import { loginSetup } from '../utils/setup.js';

export const APIHeaders = importedHeaders;

export const userEndpoint = `https://api.${env.APP_URL}/user/`;

export const requestOverThreshold = new Counter('requests over specified threshold', false);

export const threshold = env.THRESHOLD ? env.THRESHOLD : 1000;

export function defaultSetup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  }
};

export function initUserCookieJar(accessCookieData) {

  initCookieJar(userEndpoint, accessCookieData);
};