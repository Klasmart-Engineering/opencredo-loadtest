import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { default as getProgramsAndSubjects } from './getProgramsAndSubjects.js'

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

function getPrograms(userEndpoint, programID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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

  const progResp = getProgramsAndSubjects({
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    singleTest: true,
    accessCookie: accessCookie
  })
  const programID = progResp.json('data.programsConnection.edges.0.node.id');

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    programID: programID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getPrograms(data.userEndpoint, data.programID, singleTest, data.accessCookie);
};