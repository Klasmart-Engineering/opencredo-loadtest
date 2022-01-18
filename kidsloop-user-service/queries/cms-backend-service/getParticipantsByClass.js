import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { default as getClassesByOrganization } from './getClassesByOrganization.js';

const query = `query participantsByClass($class_id: ID!) {
  class(class_id: $class_id) {
    teachers {
      ...userIdName
    }
    students {
      ...userIdName
    }
  }
}

fragment userIdName on User {
  user_id
  user_name
}`;

function getClassStudentsByOrganization(userEndpoint, classID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'participantsByClass',
    variables: {
      class_id: classID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const classResp = getClassesByOrganization({
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  });
  
  const classID = classResp.json('data.organization.classes.0.class_id')

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    classID: classID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getClassStudentsByOrganization(data.userEndpoint, data.orgID, singleTest, data.accessCookie)
};