import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getClassesByOrganization } from './getClassesByOrganization.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

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

export function getParticipantsByClass(classID) {

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

  const classResp = getClassesByOrganization(orgID, accessCookie);
  const classID = classResp.json('data.organization.classes.0.class_id')

  return {
    accessCookie: accessCookie,
    classID: classID,
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getParticipantsByClass(data.classID);
  isRequestSuccessful(response);
};