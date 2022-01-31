// import k6 specific packages
import { URLSearchParams } from './jslib-url.js';
import { check, group, sleep } from 'k6';
import http from 'k6/http';
import encoding from 'k6/encoding';
import { Counter } from 'k6/metrics';

// import helpers
import { defaultHeaders, isRequestSuccessful } from '../utils/common.js'

// Code Challenge static for now
export const codeChallenge='OwxeVzVxxjEDB5_kzozq4MjSHlxen6mV8XS25rrqkgg';

// Initialise counter for HTTP 429 errors
export const count429 = new Counter('http_429_errors');

export function loginTest(appURL, tenantID, hubClientID, authClientID, policyName, username, password) {

  let response;
  let cookies;
  let params;
  let csrfToken;

  const baseURL = `login.${appURL}/${tenantID}/${policyName}`;
  const scope = `email https://login.${appURL}/${authClientID}/tasks.write openid profile offline_access`;
  const redirect = `https://auth.${appURL}/authentication-callback`;

  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();

  group('Load Login Page', function() {
    // Initial OpenID Config Check
    response = http.get(`https://${baseURL}/v2.0/.well-known/openid-configuration`, {
      headers: defaultHeaders
    });
    check(response, {
      'is openid-configuration status 200': r => r.status === 200,
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

    // Authorize
    params = new URLSearchParams([
      ['client_id', hubClientID],
      ['scope', scope],
      ['redirect_uri', redirect],
      ['response_type', 'code'],
      ['code_challenge', codeChallenge],
      ['code_challenge_method', 'S256'],
    ]);

    response = http.get(`https://${baseURL}/oauth2/v2.0/authorize?${params.toString()}`, {
      headers: defaultHeaders
    });
    check(response, {
      'is authorize status 200': r => r.status === 200,
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

    cookies = cookieJar.cookiesForURL(response.url);
    csrfToken = cookies['x-ms-cpim-csrf'][0];
  });

  group('Auth and Redirect', function() {
    // SelfAsserted
    const stateProperties = encoding.b64encode(`{"TID": "${response.headers['X-Request-Id']}"}`);

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
      password: password,
    };

    response = http.post(`https://${baseURL}/SelfAsserted?${params.toString()}`, selfAssertedFormData, {
      headers: csrfHeaders
    });
    check(response, {
      'is SelfAsserted status 200': r => r.status === 200,
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

    response = http.get(`https://${baseURL}/api/CombinedSigninAndSignup/confirmed?${params.toString()}`, {
      headers: csrfHeaders,
      redirects: 0
    });
    check(response, {
      'is confirmed status 302': r => r.status === 302,
    })
    isRequestSuccessful(response, 302);
    isResponse429(response, count429);

  });
}

function isResponse429(response, counter) {
  if (response.status === 429) {
    counter.add(1);
  }
}