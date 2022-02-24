// import k6 specific packages
import {loginSetup} from "../../../utils/setup.js";
import * as env     from "../../../utils/env.js";


export const apiHeaders = {
  'pragma':     'no-cache',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'content-type': 'application/json'
}

// Specific list not essential, essence is to have multiple files to investigate file read cache
export const corePaths = [
  "doc/spec_en.html",
  "fonts/h5p-core-23.eot",
  "fonts/h5p-core-23.svg",
  "fonts/h5p-core-23.ttf",
  "fonts/h5p-core-23.woff",
  "images/h5p.svg",
  "images/throbber.gif",
  "js/settings/h5p-disable-hub.js",
  "js/h5p-action-bar.js",
  "js/h5p-confirmation-dialog.js",
  "js/h5p-content-type.js",
  "js/h5p-content-upgrade-process.js",
  "js/h5p-content-upgrade-worker.js",
  "js/h5p-content-upgrade.js",
  "js/h5p-data-view.js",
  "js/h5p-display-options.js",
  "js/h5p-embed.js",
  "js/h5p-event-dispatcher.js",
  "js/h5p-library-details.js",
  "js/h5p-library-list.js",
  "js/h5p-resizer.js",
  "js/h5p-utils.js",
  "js/h5p-version.js",
  "js/h5p-x-api-event.js",
  "js/h5p-x-api.js",
  "js/h5p.js",
  "js/jquery.js",
  "js/request-queue.js",
  "js/triggerXAPIExperienced.js",
  "js/xapi-uploader.js",
  "styles/h5p-admin.css",
  "styles/h5p-confirmation-dialog.css",
  "styles/h5p-core-button.css",
  "styles/h5p.css"
]

export const libraries = [
  {name: 'H5P.Accordion', major: '1', minor: '0'},
  {name: 'H5P.AdvancedBlanks', major: '1', minor: '0'},
  {name: 'H5P.AdvancedBlanks', major: '1', minor: '1'},
  {name: 'H5P.AdvancedText', major: '1', minor: '1'},
  {name: 'H5P.Summary', major: '1', minor: '10'},
 
]

export const h5pEndpoint = `https://h5p.${env.APP_URL}`;


export function setupAuth() {

  const token = loginSetup();

  return {
    token: token
  }
}

// TOKEN STUFF
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/token/eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJINVAiLCJleHAiOjE2NDI0NDIyNjAsImp0aSI6IjYxZTU5MWE4OTNjM2U3MDAxM2RmYTlhMyIsImlhdCI6MTY0MjQzNTA2MCwiaXNzIjoia2wyLWg1cCIsInN1YiI6InZpZXciLCJjb250ZW50SWQiOiI2MWU1OTFhODkzYzNlNzAwMTNkZmE5YTMifQ.pCTAJ-7IC4L4_-Vwv5CVtU-myJtY-3spiIReYYw6-TOwsCK2oNNHgOcee11GYfr4c6s-njK8NSUkjNHl6EnWZJ9We2RMprbTozWo6YYYGRgjXcW4tjXo4LcOZ6LWLxyv55NKqUXdR8fyAVImf90SbSoHHEB5TAZGYwmWheRFi3Br3obyRpeXzPtb-2coxcTE2AcusA9zl2wwBIFT1f_EffJ5g92v8NwYtbYK15rfmDdMqfbjtDI8MEQn-NXm01iH2GW1kaIL-ekhFFaqQXwi7Fr6W1iGGBgSspjuO0uyTys5-SggU5yryO_ZWeLhZGFoSBiOPnrF1udpkdiJGJ8a_w
// GET  /h5p/token/:token
// POST /h5p/token/:token


// GET//h5p/ajax --> This does a load of file stuff
// POST https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries&machineName=&majorVersion=1&minorVersion=10
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries&machineName=FontAwesome&majorVersion=4&minorVersion=3
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=content-type-cache


// GET//h5p/temp-files/:file(*) --> S3 stuff (edited) 
// https://h5p.loadtest-k8s.kidsloop.live/h5p/temp-files/test001.png
