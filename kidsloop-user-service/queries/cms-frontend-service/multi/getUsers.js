import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getUsers } from '../getUsers.js';
import { getUsersByOrg } from '../getUsersByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

// TODO: This will time out in orgs with many users due to the request taking over 1m (k6) or 2m (ELB)
export function setup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  const usersResp = getUsersByOrg(orgID, userPool[0]);
  console.log(usersResp.request.body)

  // in order to prevent repeated runs caching too much data we select 5 random users
  const shuffledUsers = usersResp.json('data.organization.memberships').sort( () => 0.5 - Math.random() );
  const userIDs = shuffledUsers.slice(0, 6).map( u => u["user"]["id"] );

  return {
    userIDs: userIDs,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getUsers(data.userIDs);
  isRequestSuccessful(response);

  console.log(response.body)
};