import {
  defaultOptions
} from './common.js';
import { loginToB2C } from './functions.js';
import * as env from '../utils/env.js';

export const options = defaultOptions;

export default function main(data) {
  loginToB2C(env.USERNAME);
}