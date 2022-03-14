import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getSchoolsByOrg } from '../getSchoolsByOrg.js';
import { getTeachersBySchools } from '../getTeachersBySchools.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const schoolResp = getSchoolsByOrg(orgID);
  const schoolIDs = schoolResp.json('data.organization.schools');

  return {
    schoolIDs: schoolIDs,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getTeachersBySchools(data.schoolIDs);
  isRequestSuccessful(response);
};