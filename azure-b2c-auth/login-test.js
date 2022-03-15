import { loginToB2C } from './functions.js';
import { scenario } from 'k6/execution';
import { defaultRateOptions, getUserIDForMultiUser } from '../utils/common.js';

export const options = defaultRateOptions;

export default function main() {

  const userID = getUserIDForMultiUser(scenario.iterationInTest);

  loginToB2C(userID);
}