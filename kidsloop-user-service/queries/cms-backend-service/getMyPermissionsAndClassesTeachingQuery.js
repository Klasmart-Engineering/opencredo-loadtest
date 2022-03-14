import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query myPermissionsAndClassesTeachingQuery($organization_id: ID!) {
  me {
    user_id
    membership(organization_id: $organization_id) {
      organization_id
      schoolMemberships {
        school_id
        status
      }
      classesTeaching {
        class_id
        status
      }
    }
  }
}`;

export function getMyPermissionsAndClassesTeachingQuery(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'myPermissionsAndClassesTeachingQuery',
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

  const response = getMyPermissionsAndClassesTeachingQuery(data.orgID);
  isRequestSuccessful(response);
};