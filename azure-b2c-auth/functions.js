import * as env from '../utils/env.js';
import {
  check,
  fail,
  group
}                  from 'k6';
import {
  defaultHeaders,
  isRequestSuccessful
} from '../utils/common.js';
import { Counter }               from 'k6/metrics';
import encoding                  from 'k6/encoding';
import { generateCodeChallenge } from './common.js';
import http                      from 'k6/http';
import { URLSearchParams }       from './jslib-url.js';

/**
 * initalises a k6 metric counter for 429 status returns from azure, this is the status returned by Azure after hitting the rate limit
 *
 * @constant
 * @memberof azure-b2c
 */
export const count429 = new Counter('http_429_errors');

/**
 * function to log in to B2C and return the response with the tokens required to login to the kidsloop application
 *
 * @param {string} username - the username to log in to the application with
 * @returns {object} a k6/http response object
 * @memberof azure-b2c
 */
export function loginToB2C(username) {

  const tenantID = env.TENANT_ID;
  const policyName = env.POLICY_NAME;
  const authClientID = env.AUTH_CLIENT_ID;
  const hubClientID = env.HUB_CLIENT_ID;
  const loginURL = env.LOGIN_URL;

  let response, cookies, params, csrfToken, clientRequestID, code;

  const baseURL = `https://login.${loginURL}/${tenantID}/${policyName}`;
  const scope = `email https://login.${loginURL}/${authClientID}/tasks.write openid profile offline_access`;
  const redirect = `https://auth.${loginURL}/authentication-callback`;

  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();

  const pkce = generateCodeChallenge();

  group('Load Login Page', function() {
    // Initial OpenID Config Check
    response = http.get(`${baseURL}/v2.0/.well-known/openid-configuration`, {
      headers: defaultHeaders
    });
    check(response, {
      'is openid-configuration status 200': r => r.status === 200,
    });
    isB2CRequestSuccessful(response);

    // Authorize
    params = new URLSearchParams([
      ['client_id', hubClientID],
      ['scope', scope],
      ['redirect_uri', redirect],
      ['response_type', 'code'],
      ['code_challenge', pkce.challenge],
      ['code_challenge_method', 'S256'],
    ]);

    response = http.get(`${baseURL}/oauth2/v2.0/authorize?${params.toString()}`, {
      headers: defaultHeaders
    });
    check(response, {
      'is authorize status 200': r => r.status === 200,
    });
    isB2CRequestSuccessful(response);

    cookies = cookieJar.cookiesForURL(response.url);
    csrfToken = cookies['x-ms-cpim-csrf'][0];
    clientRequestID = response.headers['X-Request-Id'];
  });

  group('Auth and Redirect', function() {
    // SelfAsserted
    const stateProperties = encoding.b64encode(`{"TID": "${clientRequestID}"}`);

    const csrfHeaders = Object.assign({
      'x-csrf-token': csrfToken,
    }, defaultHeaders);

    params = new URLSearchParams([
      ['tx', `StateProperties=${stateProperties}`],
      ['p', policyName],
    ]);

    const selfAssertedFormData = {
      request_type: 'RESPONSE',
      signInName: username,
      password: env.PASSWORD,
    };

    response = http.post(`${baseURL}/SelfAsserted?${params.toString()}`, selfAssertedFormData, {
      headers: csrfHeaders
    });
    check(response, {
      'is SelfAsserted status 200': r => r.status === 200,
    });
    isB2CRequestSuccessful(response);

    response = http.get(`${baseURL}/api/CombinedSigninAndSignup/confirmed?${params.toString()}`, {
      headers: csrfHeaders,
      redirects: 0
    });
    if (
      !check(response, {
        'is confirmed status 302': r => r.status === 302,
        'redirect does not contain error': r => !r.headers['Location'].includes('error='),
      })
    ) {
      console.log(response.status);
      console.log(response.headers['Location']);
      fail('confirmed response failed');
    }

    isB2CRequestSuccessful(response, 302);

    const redirectURL = new URL(response.headers['Location']);
    code = redirectURL.searchParams.get('code');
  });

  group('Token', function() {
    //second openID configuration check
    response = http.get(`${baseURL}/v2.0/.well-known/openid-configuration`, {
      headers: defaultHeaders
    });
    check(response, {
      'is openid-configuration status 200': r => r.status === 200,
    });
    isB2CRequestSuccessful(response);

    const tokenPayload = {
      client_id: hubClientID,
      redirect_uri: redirect,
      scope: scope,
      code: code,
      'code_verifier': pkce.verifier,
      'grant_type': 'authorization_code',
      'client_info': 1,
      'client-request-id': clientRequestID
    };

    response = http.post(`${baseURL}/oauth2/v2.0/token`, tokenPayload, {
      headers: defaultHeaders
    });
    check(response, {
      'is token status 200': r => r.status === 200,
    });
    isB2CRequestSuccessful(response);
  });

  return response;
}

/**
 * function to check a B2C request succeeded
 *
 * @param {object} response - a k6/http response object
 * @param {number} statusCode - the expected HTTP status code
 * @returns {void} Nothing
 * @memberof azure-b2c
 */
function isB2CRequestSuccessful(response, statusCode = 200) {

  isRequestSuccessful(response, statusCode);

  if (response.status === 429) {
    count429.add(1);
  }
}