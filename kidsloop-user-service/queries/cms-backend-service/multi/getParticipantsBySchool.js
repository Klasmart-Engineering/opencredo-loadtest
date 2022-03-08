import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initCookieJar } from '../../../common.js';
import { getParticipantsBySchool } from '../getParticipantsBySchool.js';
import { getSchoolsByOrganization } from '../getSchoolsByOrganization.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  const schoolsResp = getSchoolsByOrganization(orgID, userPool[0]);
  const schoolID = schoolsResp.json('data.organization.schools.0.school_id');

  return {
    userPool: userPool,
    schoolID: schoolID
  }
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getParticipantsBySchool(data.schoolID);
  isRequestSuccessful(response);
};