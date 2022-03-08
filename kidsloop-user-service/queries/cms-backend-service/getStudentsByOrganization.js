import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query studentsByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      class_id
      class_name
      status
      schools {
        school_id
      }
      students {
        user_id
        user_name
      }
    }
    schools {
      school_id
      school_name
      classes {
        class_id
        class_name
        status
        students {
          user_id
          user_name
        }
      }
    }
  }
}`;

export function getStudentsByOrganization(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'studentsByOrganization',
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

  const respsone = getStudentsByOrganization(data.orgID);
  isRequestSuccessful(respsone);
};