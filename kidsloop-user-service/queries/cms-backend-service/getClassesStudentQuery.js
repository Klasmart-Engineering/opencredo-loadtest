import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query classesStudentQuery($user_id: ID!, $organization_id: ID!) {
  user(user_id: $user_id) {
    membership(organization_id: $organization_id) {
      classes {
        class_id
        class_name
        status
        schools {
          school_id
          school_name
        }
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
}`;

export function getClassesStudentQuery(orgID, userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesStudentQuery',
    variables: {
      user_id: userID,
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  //TODO: filter for student (can only be called by admin/teacher?)
  const userID = '';

  return {
    accessCookie: accessCookie,
    orgID: orgID,
    userID: userID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClassesStudentQuery(data.orgID, data.userID);
  isRequestSuccessful(response);
};