import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query userWithoutClassAndSchool($organization_id: UUID!) {
  usersConnection(direction: FORWARD, directionArgs: {count: 5, cursor: ""}, filter: {organizationId: {operator: eq, value: $organization_id}, classId: {operator: isNull}, organizationUserStatus: {operator: eq, value: "active"}}) {
    edges {
      node {
        id
        givenName
        familyName
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

export function getUserWithoutClassAndSchool(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'userWithoutClassAndSchool',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);
  
  const response = getUserWithoutClassAndSchool(data.orgID);
  isRequestSuccessful(response);
};