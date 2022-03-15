import http           from 'k6/http';
import {chooseRandom} from './_functions.js';
import {apiHeaders}   from './envs/_shared.js';
import {contentIds}   from './envs/_contentIds.js';
import {APP_URL}      from '../../utils/env.js'

// GET  /h5p/play/:contentId
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/play/61e5ab9293c3e70013dfa9a
export function contentPlayTest(h5pEndpoint, token) {

    const url  = `${h5pEndpoint}/h5p/play/${chooseRandom(contentIds[APP_URL])}?jwt=${token}`

    const response = http.get(url, {
        headers: apiHeaders
    });

    const cfCache = response.headers["X-Cache"]
    if (cfCache != "Hit from cloudfront") {
        console.log(cfCache)
    }

    if (response.status !== 200) {
        console.error(`${response.status}: ${url}`)
        console.error(JSON.stringify(response))
    }

}