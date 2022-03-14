import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { getClassID } from '../../../utils/setup.js';
import { initUserCookieJar } from "../../common.js";
import { getClasses } from './usrsvc_05_getClasses.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  const classID = getClassID(userPool[0]);

  return {
    classID: classID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);
  
  initUserCookieJar(data.userPool[user]);

  const response = getClasses(data.classID);
  isRequestSuccessful(response);
};