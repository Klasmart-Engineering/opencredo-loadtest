import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getSchoolTeacher } from '../getSchoolTeacher.js';
import { getTeacherByOrgId } from '../getTeacherByOrgId.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  const teacherResp = getTeacherByOrgId(orgID, userPool[0]);
  const teacherID = teacherResp.json('data.organization.classes.0.teachers.0.user_id')

  return {
    teacherID: teacherID,
    userPool: userPool
  }
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getSchoolTeacher(data.teacherID);
  isRequestSuccessful(response);
};