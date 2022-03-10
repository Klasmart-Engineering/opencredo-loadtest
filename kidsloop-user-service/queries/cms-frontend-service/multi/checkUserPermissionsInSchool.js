import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { checkUserPermissionInOrg } from '../checkUserPermissionsInOrg.js';
import { checkUserPermissionsInSchool } from '../checkUserPermissionsInSchool.js';
import { getSchoolsByOrg } from '../getSchoolsByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const returnUserIDs = true; 
  const userPool = getUserPool(returnUserIDs);

  const orgID = getOrgID(userPool[0].cookie);
  const schoolResp = getSchoolsByOrg(orgID, userPool[0].cookie);

  const schoolID = schoolResp.json('data.organization.schools.0.school_id');

  return {
    orgID: orgID,
    schoolID: schoolID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user].cookie);

  const response = checkUserPermissionsInSchool(data.schoolID, data.userPool[user].id);
  isRequestSuccessful(response);
};