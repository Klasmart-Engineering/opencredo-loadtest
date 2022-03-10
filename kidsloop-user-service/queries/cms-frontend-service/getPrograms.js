import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions } from '../../../utils/common.js';
import { initUserCookieJar, isRequestSuccessful, userEndpoint } from '../../common.js';
import { getProgramsByOrg } from './getProgramsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($program_id_0: ID!, $program_id_1: ID!) {
  q0: program(id: $program_id_0) {
    id
    name
    status
    system
  }
  q1: program(id: $program_id_1) {
    id
    name
    status
    system
  }
}`;

export function getPrograms(programIDs) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      program_id_0: programIDs[0],
      program_id_1: programIDs[1]
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const programResp = getProgramsByOrg(orgID);
  const programIDs = [
    programResp.json('data.organization.programs.0.id'),
    programResp.json('data.organization.programs.1.id')
  ];

  return {
    accessCookie: accessCookie,
    programIDs: programIDs
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getPrograms(data.programIDs);
  isRequestSuccessful(response);
};