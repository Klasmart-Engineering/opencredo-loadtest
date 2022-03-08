import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getProgramsAndSubjects } from './getProgramsAndSubjects.js'
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getPrograms($program_id: ID!) {
  program(id: $program_id) {
    id
    name
    status
    subjects {
      id
      name
      status
      categories {
        id
        name
        status
        subcategories {
          id
          name
          status
        }
      }
    }
    age_ranges {
      id
      name
      status
    }
    grades {
      id
      name
      status
    }
  }
}`;

export function getPrograms(programID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getPrograms',
    variables: {
      program_id: programID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const progResp = getProgramsAndSubjects(accessCookie);
  const programID = progResp.json('data.programsConnection.edges.0.node.id');

  return {
    accessCookie: accessCookie,
    programID: programID
  };
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getPrograms(data.programID);
  isRequestSuccessful(response);
};