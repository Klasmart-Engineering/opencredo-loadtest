import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getUsersByKeyword } from '../getUsersByKeyword.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const returnUserIDs = true; 
  const userPool = getUserPool(returnUserIDs);

  const orgID = getOrgID(userPool[0].cookie);

  return {
    orgID: orgID,
    userPool: userPool
  };
};

//Note: this is very likely to fail due to this request taking a very long time
export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user].cookie);

  const response = getUsersByKeyword(data.orgID);
  isRequestSuccessful(response);
};