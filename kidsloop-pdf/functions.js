import http from 'k6/http';
import { APIHeaders, isRequestSuccessful } from '../utils/common.js';
import uuid from '../utils/uuid.js';

export function getPagesTest(pdfEndpoint, pdfFileName) {

    let response;
    
    response = http.get(`${pdfEndpoint}/${pdfFileName}/page/1`, {
      headers: APIHeaders
    });
    isRequestSuccessful(response, 200);
}