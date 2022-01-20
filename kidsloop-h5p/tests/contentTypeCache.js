import http  from 'k6/http';

import { apiHeaders, libraries } from './envs/_shared.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=content-type-cache
export function contentTypeCacheTest(h5pEndpoint) {

    const url = `${h5pEndpoint}/h5p/ajax?action=content-type-cache`
    
    const response = http.get(url, {
        headers: apiHeaders
    });
    
    if (response.status !== 200) {
        console.error(`${response.status}: ${url}`)
    }

  }

