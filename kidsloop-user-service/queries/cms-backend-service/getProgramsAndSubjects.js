import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

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

export function getProgramsAndSubjects(accessCookie = undefined) {

  let cookies = {};

  if (accessCookie) {
    cookies = {
      access: {
        value: accessCookie,
        replace: true
      },
    };
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
    headers: APIHeaders,
    cookies: cookies,
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie,
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getProgramsAndSubjects();
  isRequestSuccessful(response);
};