// import k6 specific packages
import * as env from '../../../utils/env.js';

/**
 * predefined API headers specifically for H5P content tests
 *
 * @constant
 * @type {object}
 * @memberof h5p-library
 */
export const apiHeaders = {
  'pragma':     'no-cache',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'content-type': 'application/json'
};

// Specific list not essential, essence is to have multiple files to investigate file read cache
/**
 * List of files that are part of H5P, used to test responsiveness of core parts of H5P
 *
 * @constant
 * @type {string[]}
 * @memberof h5p-library
 */
export const corePaths = [
  'doc/spec_en.html',
  'fonts/h5p-core-23.eot',
  'fonts/h5p-core-23.svg',
  'fonts/h5p-core-23.ttf',
  'fonts/h5p-core-23.woff',
  'images/h5p.svg',
  'images/throbber.gif',
  'js/settings/h5p-disable-hub.js',
  'js/h5p-action-bar.js',
  'js/h5p-confirmation-dialog.js',
  'js/h5p-content-type.js',
  'js/h5p-content-upgrade-process.js',
  'js/h5p-content-upgrade-worker.js',
  'js/h5p-content-upgrade.js',
  'js/h5p-data-view.js',
  'js/h5p-display-options.js',
  'js/h5p-embed.js',
  'js/h5p-event-dispatcher.js',
  'js/h5p-library-details.js',
  'js/h5p-library-list.js',
  'js/h5p-resizer.js',
  'js/h5p-utils.js',
  'js/h5p-version.js',
  'js/h5p-x-api-event.js',
  'js/h5p-x-api.js',
  'js/h5p.js',
  'js/jquery.js',
  'js/request-queue.js',
  'js/triggerXAPIExperienced.js',
  'js/xapi-uploader.js',
  'styles/h5p-admin.css',
  'styles/h5p-confirmation-dialog.css',
  'styles/h5p-core-button.css',
  'styles/h5p.css'
];

/**
 * List of H5P Libraries and version numbers
 *
 * @constant
 * @type {object[]}
 * @memberof h5p-library
 */
export const libraries = [
  {name: 'H5P.Accordion', major: '1', minor: '0'},
  {name: 'H5P.AdvancedBlanks', major: '1', minor: '0'},
  {name: 'H5P.AdvancedBlanks', major: '1', minor: '1'},
  {name: 'H5P.AdvancedText', major: '1', minor: '1'},
  {name: 'H5P.Summary', major: '1', minor: '10'},

];

/**
 * Default H5P endpoint
 *
 * @constant
 * @type {string}
 * @memberof h5p-library
 */
export const h5pEndpoint = `https://h5p.${env.APP_URL}`;