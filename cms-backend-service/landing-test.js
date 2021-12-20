// This file queries the same URLs as the initial landing on Hub

// import k6 specific packages
import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

// import helpers
import { loginSetup } from '../utils/setup.js'

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 1.5s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 3s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:in:mumbai',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:us:portland',
          percent: 50
        },
      }
    }
  }
}

const APP_URL = 'loadtest.kidsloop.live';
const USERNAME = __ENV.USERNAME

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function setup() {
  const accessCookie = loginSetup(APP_URL, USERNAME, 'dev');

  const orgResp = http.post(`https://api.${APP_URL}/user/`, JSON.stringify({
    query: '{\n  my_users {\n    memberships {\n      organization_id\n      status\n    }\n  }\n}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie,
    }
  })

  return {
    accessCookie: accessCookie,
    orgID: orgResp.json('data.my_users.0.memberships.0.organization_id')
  }
}

export default function main(data) {

  const CMS_URL = `https://cms.${APP_URL}`
  
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(CMS_URL, 'access', data.accessCookie);
  cookieJar.set(CMS_URL, 'locale', 'en');
  cookieJar.set(CMS_URL, 'privacy', 'true');

  let response;

  response = http.get(`${CMS_URL}/v1/contents_folders?content_type=2&order_by=-create_at&org_id=${data.orgID}&page=1&page_size-100&path=&publish_status=published`, {
    headers: APIHeaders
  })

  console.log(response.body)
}