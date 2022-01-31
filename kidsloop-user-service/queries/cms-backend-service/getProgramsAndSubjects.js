import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

const query = `query getProgramsAndSubjects($count: PageSize!,  $cursor: String!, $filter: ProgramFilter!) {
  programsConnection(filter:$filter
  directionArgs: {
    count:  $count
    cursor: $cursor
  }
  direction: FORWARD
){
    totalCount
    pageInfo{
      hasNextPage
      endCursor
    }
    edges{
      node{
        id
        name
        status
        system
        ageRanges{
          id
          name
          status
          system
        }
        grades{
          id
          name
          status
          system
        }
				subjects{
        	id
        	name
        	status
          system
        }
      }
    }
  }
}`;

function getProgramsAndSubjects(userEndpoint, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getProgramsAndSubjects',
    variables: {
      count: 50,
      cursor: '',
      filter: {
        status: {
          operator: 'eq',
          value: 'active'
        }
      }
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getProgramsAndSubjects(data.userEndpoint, singleTest, data.accessCookie);
};