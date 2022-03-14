import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getClassesByOrganization } from '../getClassesByOrganization.js';
import { getClassesByTeacher } from '../getClassesByTeacher.js';
import { getParticipantsByClass } from '../getParticipantsByClass.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  const classResp = getClassesByOrganization(orgID, userPool[0]);
  const classID = classResp.json('data.organization.classes.0.class_id')

  return {
    classID: classID,
    userPool: userPool
  }
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getParticipantsByClass(data.classID);
  isRequestSuccessful(response);
};