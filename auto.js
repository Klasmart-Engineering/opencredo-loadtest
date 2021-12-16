import { sleep, group } from 'k6'
import http from 'k6/http'

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 1.5s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 3s
  },
}

//AMS specific values
const USERNAME = 'max.flintoff+testlogin@opencredo.com';
const PASSWORD = __ENV.PASSWORD;
const AMSURL = 'auth.dev.badanamu.net';

const APPURL = 'loadtest.kidsloop.live';

const userAgent = 'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';
const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

// Run AMS login in the setup phase so it's run once per test
export function setup() {
  
  const loginPay = JSON.stringify({
    email: USERNAME,
    pw: PASSWORD,
    deviceId: "loadtest",
    deviceName: "k6",
  });

  const response = http.post(`https://${AMSURL}/v1/login`, loginPay, {
    headers: APIHeaders
  });

  return {
    token: response.json('accessToken')
  }
}

export default function main(data) {

  const accessToken = data.token;

  let response;
  http.cookieJar();

  group('Initial load of Hub', function () {

    http.get(`https://hub.${APPURL}/`, {
      headers: defaultHeaders
    });
    http.get(`https://auth.${APPURL}/refresh`, {
      headers: defaultHeaders,
    });
    http.options(`https://auth.${APPURL}/refresh`, null, {
      headers: defaultHeaders,
    });
  });

  let userPayload, userID, orgID;

  group('Load redirected Auth', function () {

    http.get(`https://auth.${APPURL}/?continue=https%3A%2F%2Fhub.${APPURL}%2F%23%2F`, {
      headers: defaultHeaders,
    });

    let userBody = JSON.stringify({
      operationName: 'me'
    });

    response = http.post(`https://api.${APPURL}/user/`, userBody, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    //Login to AMS happens here

    const authPayload = JSON.stringify({
      token: accessToken
    });

    http.post( `https://auth.${APPURL}/transfer`, authPayload, {
      headers: APIHeaders
    });

    userPayload = JSON.stringify({
      variables: {},
      query: "{\n  my_users {\n    user_id\n    full_name\n    given_name\n    family_name\n    email\n    phone\n    date_of_birth\n    avatar\n    username\n    __typename\n  }\n}\n"
    });

    response = http.post(`https://api.${APPURL}/user/`, userPayload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders,
    });

    userID = response.json('data.my_users.0.user_id')

    const switchPayload = JSON.stringify({
      user_id: userID
    });

    http.post(`https://auth.${APPURL}/switch`, switchPayload, {
      headers: APIHeaders
    });

    userPayload = JSON.stringify({
      query: "query {\n        me {\n            avatar\n            email\n            user_id\n            user_name\n        }\n    }"
    });

    //following 5 calls to user service repeats of above

    for(let i = 0; i < 5; i++){

      http.post(`https://api.${APPURL}/user/`, userPayload, {
        headers: APIHeaders
      });
  
      http.options(`https://api.${APPURL}/user/`, null, {
        headers: defaultHeaders,
      });
    }
  
    http.get(`https://hub.${APPURL}/`, {
      headers: defaultHeaders,
    });

  });

  group('Redirect to Hub', function () {

    http.get(`https://hub.${APPURL}/`, {
      headers: defaultHeaders
    });

    http.get(`https://auth.${APPURL}/refresh`, {
      headers: defaultHeaders
    });

    http.options(`https://auth.${APPURL}/refresh`, null, {
      headers: defaultHeaders
    });

    http.get(`https://kl2.${APPURL}/v1/assessments_summary?org_id=`, {
      headers: defaultHeaders
    });

    http.options(`https://kl2.${APPURL}/v1/assessments_summary?org_id=`, null, {
      headers: defaultHeaders
    });

    http.get(`https://auth.${APPURL}/refresh`, {
      headers: defaultHeaders
    });

    http.options(`https://auth.${APPURL}/refresh`, null, {
      headers: defaultHeaders
    });

    let userOpPayload = JSON.stringify({
      operationName: 'user',
      variables: {
        user_id: '',
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: 'd5267f2a64b8e3d60170ed624964e5bdd3bfa3ad0832185408a76b352645bdb1'
        },
      },
    })

    for(let i = 0; i < 3; i++){

      response = http.post(`https://api.${APPURL}/user/`, userOpPayload, {
        headers: APIHeaders
      });

      http.options(`https://api.${APPURL}/user/`, null, {
        headers: defaultHeaders
      });
    }

    const classOpPayload = JSON.stringify({
      operationName: 'class',
      variables: {
        class_id: '',
        organization_id: '',
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '7c4489c14c23d3f6aa1bae6bd34b8fabdda4a50c3fc9d6e3aee6c3ce8cde1d37',
        },
      },
    });

    response = http.post(`https://api.${APPURL}/user/`, classOpPayload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    const c26Payload = JSON.stringify({
      variables: {},
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '4b20084d57fa520af6ec9eca8b7e8a9853c2deafb592d7b4a66027a86a291c26',
        },
      },
    });

    for(let i = 0; i < 13; i++) {
      response = http.post(`https://api.${APPURL}/user/`, c26Payload, {
        headers: APIHeaders
      });
  
      http.options(`https://api.${APPURL}/user/`, null, {
        headers: defaultHeaders
      });
    }

    const c15Payload = JSON.stringify({
      variables: {},
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '4b20084d57fa520af6ec9eca8b7e8a9853c2deafb592d7b4a66027a86a291c26',
        },
      },
    });

    response = http.post(`https://api.${APPURL}/user/`, c15Payload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    const c59Payload = JSON.stringify({
      variables: {},
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: 'e8aadcdc087968510768335ce0c01c8fe422c46366b20ccb27244f60e88b6c59',
        },
      },
    });

    response = http.post(`https://api.${APPURL}/user/`, c59Payload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    userPayload = JSON.stringify({
      query: "query me {  me {    avatar    email    phone    user_id    username    given_name    family_name  }}"
    })

    response = http.post(`https://api.${APPURL}/user/`, userPayload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    userOpPayload = JSON.parse(userOpPayload)
    userOpPayload.variables.user_id = userID;
    userOpPayload = JSON.stringify(userOpPayload)

    response = http.post(`https://api.${APPURL}/user/`, userOpPayload, {
      headers: APIHeaders
    });

    response = http.post(`https://api.${APPURL}/user/`, userOpPayload, {
      headers: APIHeaders
    });

    response = http.post(`https://api.${APPURL}/user/`, userOpPayload, {
      headers: APIHeaders
    });

    orgID = response.json('data.user.memberships.0.organization_id')

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const timeGE = Math.floor(fourteenDaysAgo.getTime() / 1000);
    const timeLE = Math.floor(now.getTime() / 1000);

    const assessmentsForStudentURL = `https://kl2.${APPURL}/v1/assessments_for_student?complete_at_ge=${timeGE}&complete_at_le=${timeLE}&order_by=-complete_at&org_id=${orgID}&page=1&page_size=5&type=home_fun_study`;

    http.get(assessmentsForStudentURL, {
      headers: APIHeaders
    });

    http.options(assessmentsForStudentURL, null, {
      headers: defaultHeaders
    });

    const assessmentSummaryURL = `https://kl2.${APPURL}/v1/assessments_summary?org_id=${orgID}`;

    http.get(assessmentSummaryURL, {
      headers: APIHeaders
    });

    http.options(assessmentSummaryURL, null, {
      headers: defaultHeaders
    });

    const scheduleTimeViewURL = `https://kl2.${APPURL}/v1/schedules_time_view?end_at_le=${timeLE}&org_id=${orgID}&start_at_ge=${timeGE}&time_zone_offset=0&view_type=full_view`;

    http.get(scheduleTimeViewURL, {
      headers: APIHeaders
    });

    http.options(scheduleTimeViewURL, null, {
      headers: defaultHeaders
    });

    response = http.post(`https://api.${APPURL}/user/`, c15Payload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

    const mePayload = JSON.stringify({
      operationName: "me",
      variables: {},
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "1e8315611337458bcb14cc7e47110057f9549454a7f3afc9396d090962d1c430",
        },
      },
    });

    response = http.post(`https://api.${APPURL}/user/`, mePayload, {
      headers: APIHeaders
    });

    http.options(`https://api.${APPURL}/user/`, null, {
      headers: defaultHeaders
    });

  })

  // Automatically added sleep
  sleep(1)
}
