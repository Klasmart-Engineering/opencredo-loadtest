import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, initCookieJar, isRequestSuccessful } from "../../../utils/common.js";
import { getClassID } from '../../../utils/setup.js';
import { userEndpoint } from "../../common.js";
import { getClasses } from './usrsvc_05_getClasses.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  const classID = getClassID(userPool[0]);

  return {
    userPool: userPool,
    classID: classID
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);
  
  initCookieJar(userEndpoint, data.userPool[user]);

  const response = getClasses(data.classID);
  isRequestSuccessful(response);

  return response;
};