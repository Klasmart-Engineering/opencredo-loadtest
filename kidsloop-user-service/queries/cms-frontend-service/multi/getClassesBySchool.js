import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getClassesBySchool } from '../getClassesBySchool.js';
import { getSchoolsByOrg } from '../getSchoolsByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const schoolResp = getSchoolsByOrg(orgID, userPool[0]);
  const schoolID = schoolResp.json('data.organization.schools.0.school_id');

  return {
    schoolID: schoolID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getClassesBySchool(data.schoolID);
  isRequestSuccessful(response);
};