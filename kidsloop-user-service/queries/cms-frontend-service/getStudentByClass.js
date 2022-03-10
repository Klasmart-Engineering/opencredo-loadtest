import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getClassesByOrg } from './getClassesByOrg.js';

export const options = defaultRateOptions;

const query = `query ($class_id: ID!) {
  class(class_id: $class_id) {
    students {
      id: user_id
      name: user_name
    }
  }
}`;

export function getStudentByClass(classID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      class_id: classID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const classResp = getClassesByOrg(orgID);
  const classID = classResp.json('data.q0.classes.0.id');

  return {
    accessCookie: accessCookie,
    classID: classID
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getStudentByClass(data.classID);
  isRequestSuccessful(response);
}