import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

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

function getClassesStudentQuery(userEndpoint, userID, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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

  return getClassesStudentQuery(data.userEndpoint, data.userID, data.orgID, singleTest, data.accessCookie);
};