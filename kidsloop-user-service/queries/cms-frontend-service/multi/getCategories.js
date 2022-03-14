import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getCategories } from '../getCategories.js';
import { getCategoriesBySubject } from '../getCategoriesBySubject.js';
import { getSubjectsByOrg } from '../getSubjectsByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  const subjectResp = getSubjectsByOrg(orgID, userPool[0]);
  const subjectID = subjectResp.json('data.organization.subjects.0.id');

  const categoryResp = getCategoriesBySubject(subjectID, userPool[0]);
  const categories = categoryResp.json('data.q0.categories');

  return {
    categories: categories,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getCategories(data.categories);
  isRequestSuccessful(response);
};