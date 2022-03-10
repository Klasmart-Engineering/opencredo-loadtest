import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getClass } from '../getClass.js';
import { getClassesByOrg } from '../getClassesByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const classResp = getClassesByOrg(orgID, userPool[0]);
  const classID = classResp.json('data.q0.classes.0.id');

  return {
    classID: classID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getClass(data.classID);
  isRequestSuccessful(response);
};