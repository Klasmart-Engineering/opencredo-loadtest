import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

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

function getUserWithoutClassAndSchool(userEndpoint, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  }

  return getUserWithoutClassAndSchool(data.userEndpoint, data.orgID, singleTest, data.accessCookie);
};