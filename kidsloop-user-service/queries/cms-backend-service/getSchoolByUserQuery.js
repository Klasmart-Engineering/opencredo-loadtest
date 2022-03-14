import http from 'k6/http';
import { getOrgID, loginSetupWithUserID } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query schoolByUserQuery($user_id: ID!, $organization_id: ID!) {
  user(user_id: $user_id) {
    membership(organization_id: $organization_id) {
      schoolMemberships {
        school {
          school_id
          school_name
          classes {
            status
            class_id
            class_name
            teachers {
              user_id
              user_name
            }
            students {
              user_id
              user_name
            }
          }
        }
      }
    }
  }
}`;

export function getSchoolByUserQuery(userID, orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'schoolByUserQuery',
    variables: {
      user_id: userID,
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const setup = loginSetupWithUserID();

  const orgID = getOrgID(setup.cookie);

  return {
    accessCookie: setup.cookie,
    orgID: orgID,
    userID: setup.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSchoolByUserQuery(data.userID, data.orgID);
  isRequestSuccessful(response);
};