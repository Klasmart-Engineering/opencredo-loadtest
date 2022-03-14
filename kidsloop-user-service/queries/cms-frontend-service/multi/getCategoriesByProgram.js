import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getCategoriesByProgram } from '../getCategoriesByProgram.js';
import { getProgramsByOrg } from '../getProgramsByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const programResp = getProgramsByOrg(orgID, userPool[0]);
  const programID = programResp.json('data.organization.programs.0.id');

  return {
    programID: programID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getCategoriesByProgram(data.programID);
  isRequestSuccessful(response);
};