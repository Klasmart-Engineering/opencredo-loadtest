import http from 'k6/http';
import * as queries from './queries.js';
import uuid from '../utils/uuid.js';

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'

const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)



export function xapiTest(xapiEndpoint) {
    const xapiEvent = `{"xapi":{"type":"xAPI","data":{"statement":{"actor":{"account":{"name":"${uuid.v4()}"},"objectType":"Agent"},"verb":{"id":"http://adlnet.gov/expapi/verbs/attempted","display":{"en-US":"attempted"}},"object":{"objectType":"Activity","definition":{"extensions":{"http://h5p.org/x-api/h5p-local-content-id":"611db969c426830013108c40"},"name":{"en-US":"Celebration Memory Game 2"}}},"context":{"contextActivities":{"category":[{"id":"http://h5p.org/libraries/H5P.MemoryGame-1.3","objectType":"Activity"}]}}}},"clientTimestamp":${Date.now()}},"userId":"${uuid.v4()}","ipHash":"152592a2f2db5a645d9e1bd6468368be0d15cfb7c96ac1099313d85e810adb52","geo":{"range":[1531035136,1531035647],"country":"DE","region":"BE","eu":"1","timezone":"Europe/Berlin","city":"Berlin","ll":[52.4669,13.4298],"metro":0,"area":5},"serverTimestamp":${Date.now()}}`
    return http.post(xapiEndpoint, JSON.stringify({
      query: queries.SEND_EVENT,
      operationName: 'xapi',
      variables: {
        xapiEvents: [
          xapiEvent
        ]
      }
    }), {
      headers: APIHeaders
    });
}

