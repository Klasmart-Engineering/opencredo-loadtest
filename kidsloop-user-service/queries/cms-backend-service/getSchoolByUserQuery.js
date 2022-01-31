import http from 'k6/http';
import { getOrgID, loginSetup, getUserID } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

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

function getSchoolByUserQuery(userEndpoint, userID, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const userID = getUserID('', accessCookie);

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID: userID,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getSchoolByUserQuery(data.userEndpoint, data.userID, data.orgID, singleTest, data.accessCookie);
};