import {
  defaultOptions
} from './common.js';
import { loginToB2C } from './functions.js';

export const options = defaultOptions;

export default function main(data) {
  loginToB2C();
}