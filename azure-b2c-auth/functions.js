import {
  generateCodeChallenge
} from './common.js'

// import k6 specific packages
import { URLSearchParams } from './jslib-url.js';
import { check, group } from 'k6';
import http from 'k6/http';
import encoding from 'k6/encoding';
import { Counter } from 'k6/metrics';
import * as env from '../utils/env.js';

// import helpers
import { defaultHeaders, isRequestSuccessful } from '../utils/common.js'

// Initialise counter for HTTP 429 errors
export const count429 = new Counter('http_429_errors');

export function loginToB2C() {

  //initalise variables for B2C from env - if not set load the loadtest environment defaults
  const tenantID = env.TENANT_ID ? env.TENANT_ID : '8d922fec-c1fc-4772-b37e-18d2ce6790df';
  const policyName = env.POLICY_NAME ? env.POLICY_NAME : 'B2C_1A_RELYING_PARTY_SIGN_UP_LOG_IN';
  const authClientID = env.AUTH_CLIENT_ID ? env.AUTH_CLIENT_ID : '926001fe-7853-485d-a15e-8c36bb4acaef';
  const hubClientID = env.HUB_CLIENT_ID ? env.HUB_CLIENT_ID : '24bc7c47-97c6-4f27-838e-093b3948a5ca';

  let response, cookies, params, csrfToken, clientRequestID, code;

  const baseURL = `https://login.${env.APP_URL}/${tenantID}/${policyName}`;
  const scope = `email https://login.${env.APP_URL}/${authClientID}/tasks.write openid profile offline_access`;
  const redirect = `https://auth.${env.APP_URL}/authentication-callback`;

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
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

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
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

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
      signInName: env.USERNAME,
      password: env.PASSWORD,
    };

    response = http.post(`${baseURL}/SelfAsserted?${params.toString()}`, selfAssertedFormData, {
      headers: csrfHeaders
    });
    check(response, {
      'is SelfAsserted status 200': r => r.status === 200,
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

    response = http.get(`${baseURL}/api/CombinedSigninAndSignup/confirmed?${params.toString()}`, {
      headers: csrfHeaders,
      redirects: 0
    });
    check(response, {
      'is confirmed status 302': r => r.status === 302,
    })
    isRequestSuccessful(response, 302);
    isResponse429(response, count429);

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
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);

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
    })
    isRequestSuccessful(response);
    isResponse429(response, count429);
  })

  return response;
}

function isResponse429(response, counter) {
  if (response.status === 429) {
    counter.add(1);
  }
}