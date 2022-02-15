import group from 'k6';
import http  from 'k6/http';

import { chooseRandom } from './_functions.js';
import { apiHeaders, libraries } from './envs/_shared.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/libraries/*
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries&machineName=FontAwesome&majorVersion=4&minorVersion=3
export function librariesTest(h5pEndpoint) {
  
    const library = chooseRandom(libraries)  
    const libraryPath = `h5p/libraries/${library.name}-${library.major}.${library.minor}/library.json`
    const url2  = `${h5pEndpoint}/${libraryPath}`
    const response2 = http.get(url2, {
        headers: apiHeaders
    });
    if (response2.status !== 200) {
        console.error(`${response2.status}: ${url2}`)
        console.error(JSON.stringify(response))
    }

  }

