import http  from 'k6/http';

import { chooseRandom } from './_functions.js';
import { apiHeaders }   from './envs/_shared.js';
import { contentIds }   from './envs/loadtest-k8s.js';

// GET  /h5p/play/:contentId
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/play/61e5ab9293c3e70013dfa9a
export function contentParamsTest(h5pEndpoint) {

    const url = `${h5pEndpoint}/h5p/params/${chooseRandom(contentIds)}`

    const response = http.get(url, {
        headers: apiHeaders
    });

    if (response.status !== 200) {
        console.error(`${response.status}: ${url}`)
        console.error(JSON.stringify(response))
    }

}