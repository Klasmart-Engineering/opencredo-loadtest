import { scenario } from 'k6/execution';
import { defaultRateOptions, getCurrentUserFromPool, getUserPool, isRequestSuccessful } from '../../../../utils/common.js';
import { initCookieJar } from '../../../common.js';
import { getPrograms } from '../getPrograms.js';
import { getProgramsAndSubjects } from '../getProgramsAndSubjects.js';

export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
});

export function setup() {

  const userPool = getUserPool();

  const progResp = getProgramsAndSubjects(userPool[0]);
  const programID = progResp.json('data.programsConnection.edges.0.node.id');

  return {
    programID: programID,
    userPool: userPool
  };
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getPrograms(data.programID);
  isRequestSuccessful(response);
};