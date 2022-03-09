import { scoreByUser } from './functions.js'
import { initCookieJar } from '../utils/common.js';
import {
  defaultOptions,
  defaultSetup,
  assessmentEndpoint,
} from './common.js';

export const options = defaultOptions;

export function setup() {
  return defaultSetup();
}

export default function main(data) {

  initCookieJar(assessmentEndpoint, data.accessCookie);
  
  scoreByUser();
}