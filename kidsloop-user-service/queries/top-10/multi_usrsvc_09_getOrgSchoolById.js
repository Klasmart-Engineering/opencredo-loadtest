import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from "../../../utils/common.js";
import { getOrgID, getSchoolID } from '../../../utils/setup.js';
import { initUserCookieJar } from '../../common.js';
import { getOrgSchoolById } from './usrsvc_09_getOrgSchoolById.js';

export const options = defaultRateOptions;

export function setup() {

  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  return {
    orgID: getOrgID(userPool[0]),
    schoolID: getSchoolID(userPool[0]),
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getOrgSchoolById(
    data.orgID,
    data.schoolID
  );
  isRequestSuccessful(response);
};