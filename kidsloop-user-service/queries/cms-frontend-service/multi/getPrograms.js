import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { getOrgID } from '../../../../utils/setup.js';
import { initUserCookieJar } from '../../../common.js';
import { getPrograms } from '../getPrograms.js';
import { getProgramsByOrg } from '../getProgramsByOrg.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();
  
  const orgID = getOrgID(userPool[0]);

  const programResp = getProgramsByOrg(orgID, userPool[0]);
  const programIDs = [
    programResp.json('data.organization.programs.0.id'),
    programResp.json('data.organization.programs.1.id')
  ];

  return {
    programIDs: programIDs,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initUserCookieJar(data.userPool[user]);

  const response = getPrograms(data.programIDs);
  isRequestSuccessful(response);
};