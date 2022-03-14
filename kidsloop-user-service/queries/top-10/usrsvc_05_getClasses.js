import http from 'k6/http';
import { getClassID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getClasses(classID) {

  return http.post(userEndpoint, JSON.stringify({
    query: `query getClasses($class_id: ID!) {
      class(class_id: $class_id) {
        schools {
          school_id
        }
      }
    }`,
    operationName: 'getClasses',
    variables: {
      class_id: classID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const classID = getClassID(accessCookie);

  return {
    accessCookie: accessCookie,
    classID:      classID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClasses(data.classID);
  isRequestSuccessful(response);
};