import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getSubcategories } from '../getSubcategories.js';
import { getSubcategoriesByOrg } from '../getSubcategoriesByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const subcategoryResp = getSubcategoriesByOrg(orgID, userPool[0]);
  const subcategories = subcategoryResp.json('data.organization.subcategories');

  return {
    subcategories: subcategories,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getSubcategories(data.subcategories);
  isRequestSuccessful(response);
};