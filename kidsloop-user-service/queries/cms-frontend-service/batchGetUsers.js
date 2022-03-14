import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `{
  usersConnection(direction: BACKWARD) {
    edges {
      node {
        id
        classesTeachingConnection(filter: {status: {operator: eq, value: "active"}}) {
          edges {
            node {
              id
              name
              status
              studentsConnection(
                filter: {userStatus: {operator: eq, value: "active"}, organizationUserStatus: {operator: eq, value: "active"}}
              ) {
                edges {
                  node {
                    id
                    givenName
                    familyName
                    status
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export function batchGetUsers() {

  return http.post(userEndpoint, JSON.stringify({
    query: query
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = batchGetUsers();
  isRequestSuccessful(response);
}