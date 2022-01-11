// import k6 specific packages
import http from 'k6/http';
import { check } from 'k6';

// import helpers

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function loginTest(authEndpoint, accessToken, userID) {

  let response;

  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(authEndpoint, 'locale', 'en');
  cookieJar.set(authEndpoint, 'privacy', 'true');

  const transferPayload = JSON.stringify({
    token: accessToken
  });

  response = http.post(`${authEndpoint}/transfer`, transferPayload, {
    headers: APIHeaders
  });

  let accessCookie = '';

  if (
    check(response, {
      'has status 200': (r) => r.status === 200,
      'has cookie': (r) => r.cookies.access,
    })
  ) {
    if (
      check(response, {
        'has access cookie': (r) => r.cookies.access[0],
      })
    ) {
      accessCookie = response.cookies.access[0].value;
    }
  }

  if (accessCookie) {
  
    cookieJar.set(authEndpoint, 'access', accessCookie);
  
    const switchPayload = JSON.stringify({
      user_id: userID
    })
  
    response = http.post(`${authEndpoint}/switch`, switchPayload, {
      headers: APIHeaders
    });
  
    for (let i = 0; i < 5; i++) {
      http.get(`${authEndpoint}/refresh`, {
        headers: APIHeaders
      })
    }
  }
}