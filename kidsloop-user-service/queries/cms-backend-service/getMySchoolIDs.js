import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query mySchoolIDs($organization_id: ID!) {
  me {
    membership(organization_id: $organization_id) {
      schoolMemberships {
        school_id
      }
    }
  }
}
`;

export function getMySchoolIDs(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'mySchoolIDs',
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

  const response = getMySchoolIDs(data.orgID);
  isRequestSuccessful(response);
};