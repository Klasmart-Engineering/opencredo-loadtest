import http from 'k6/http';

const userAgent = 'k6 - open credo loadtest';

export const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function isRequestSuccessful(response, expectedStatus = 200) {

  if (response.status !== expectedStatus) {
    console.error(response.status)
    console.error(JSON.stringify(response))
    if (response.status == 502) {
      console.error(JSON.stringify(response))
    }
  }
}

export function initCookieJar(userEndpoint, accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(userEndpoint, 'access', accessCookieData);
  cookieJar.set(userEndpoint, 'locale', 'en');
  cookieJar.set(userEndpoint, 'privacy', 'true');
};