import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($or:[UserFilter!]){
  usersConnection(direction:BACKWARD, filter:{OR:$or}) {
    edges{
      node{
        id
        classesTeachingConnection(filter:{status: {operator: eq, value: "active"}}){
          edges{
            node{
              id
              name
              status
              studentsConnection(filter:{userStatus:{operator: eq, value: "active"}, organizationUserStatus:{operator:eq, value: "active"}}){
                edges{
                  node{
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

export function batchGetUsers(userEndpoint, or, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  }

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'batchGetUsers',
    variable: {
      or: or
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    or: '', //TODO: Fix this... what data goes here?
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return batchGetUsers(data.userEndpoint, data.or, data.accessCookie, singleTest)
}