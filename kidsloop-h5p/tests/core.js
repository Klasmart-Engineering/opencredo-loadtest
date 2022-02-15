import http  from 'k6/http';

import { chooseRandom } from './_functions.js';
import { apiHeaders, corePaths } from './envs/_shared.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/core/*
export function coreTest(h5pEndpoint) {

    const url  = `${h5pEndpoint}/h5p/core/${chooseRandom(corePaths)}`
    const response = http.get(url, {
        headers: apiHeaders
    });
    if (response.status !== 200) {
        console.error(`${response.status}: ${url}`)
        console.error(JSON.stringify(response))
        }

}