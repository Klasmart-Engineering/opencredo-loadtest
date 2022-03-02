import { loginSetup } from '../utils/setup.js'
import { xapiTest } from './functions.js'
import {defaultRateOptions} from "../utils/common.js";

export const options = defaultRateOptions

const APP_URL = __ENV.APP_URL
const USERNAME = __ENV.USERNAME
const AMSENV = __ENV.AMSENV

export function setup() {

  console.log(APP_URL);
  let amsEnv = AMSENV
  if (!amsEnv) {
    amsEnv = 'dev'
  }

  return {
    accessCookie: loginSetup(APP_URL, USERNAME, amsEnv)
  }
}

export default function main(data) {
  xapiTest(`https://api.${APP_URL}/xapi/graphql`, data.accessCookie);
}