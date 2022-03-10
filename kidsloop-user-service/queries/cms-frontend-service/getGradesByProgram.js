import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getProgramsByOrg } from './getProgramsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($program_id: ID!) {
  program(id: $program_id) {
    grades {
      id
      name
      status
      system
    }
  }
}`;

export function getGradesByProgram(programID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      program_id: programID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const programResp = getProgramsByOrg(orgID);
  const programID = programResp.json('data.organization.programs.0.id');

  return {
    accessCookie: accessCookie,
    programID: programID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);
  
  const response = getGradesByProgram(data.programID);
  isRequestSuccessful(response);
};