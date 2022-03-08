import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query participantsByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    status
    classes {
      teachers {
        user_id
        user_name
        school_memberships {
          school_id
          school {
            organization {
              organization_id
            }
          }
        }
      }
      students {
        user_id
        user_name
        school_memberships {
          school_id
        }
      }
    }
  }
}`;

export function getParticipantsByOrganization(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'participantsByOrganization',
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

  initCookieJar(data.accessCookie);

  const response = getParticipantsByOrganization(data.orgID);
  isRequestSuccessful(response);
};