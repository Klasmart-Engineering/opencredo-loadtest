import http         from 'k6/http';
import {apiHeaders} from './envs/_shared.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=content-type-cache
export function contentTypeCacheTest(h5pEndpoint, token) {

    const url = `${h5pEndpoint}/h5p/ajax?action=content-type-cache&jwt=${token}`
    
    const response = http.get(url, {
        headers: apiHeaders
    });
    
    if (response.status !== 200) {
        console.error(`${response.status}: ${url}`)
        console.error(JSON.stringify(response))
    }

  }

