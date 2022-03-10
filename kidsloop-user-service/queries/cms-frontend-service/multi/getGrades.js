import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getGrades } from '../getGrades.js';
import { getGradesByOrg } from '../getGradesByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const gradesResp = getGradesByOrg(orgID, userPool[0]);
  const gradeID = gradesResp.json('.data.organization.grades.0.id');

  return {
    gradeID: gradeID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getGrades(data.gradeID);
  isRequestSuccessful(response);
};