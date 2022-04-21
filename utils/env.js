/* eslint-disable no-undef */

/**
 * @namespace environment
 */

/**
 * the base app domain (eg kidsloop.live)
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const APP_URL = __ENV.APP_URL;

/**
 * the app domain
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const APP_URL_TEST = __ENV.APP_URL_TEST;

/**
 * the azure b2c base domain if different from the app domain, defaults to APP_URL
 *
 * @constant
 * @type {string}
 * @default APP_URL
 * @memberof environment
 */
export const LOGIN_URL = __ENV.LOGIN_URL ? __ENV.LOGIN_URL : APP_URL;

/**
 * When using a single user test, the username to log in to the application with
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const USERNAME = __ENV.USERNAME;

/**
 * AMS environment to use (dev/prod)
 *
 * @constant
 * @type {string}
 * @memberof environment
 * @deprecated AMS is no longer in use
 */
export const AMSENV = __ENV.AMSENV;

/**
 * which test to run, if unset defaults to all tests
 * only implemented in kidsloop-user-service/landing-test.js
 *
 * @constant
 * @type {number}
 * @memberof environment
 */
export const TESTVAL = __ENV.TESTVAL;

/**
 * the password to use to log in to the application
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const PASSWORD = __ENV.PASSWORD;

/**
 * for tests where not logging in to the application, a valid access cookie JWT string
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const ACCESS_COOKIE = __ENV.ACCESS_COOKIE;

/**
 * for environments where CMS is behind a different URL
 *
 * @constant
 * @type {string}
 * @default cms
 * @memberof environment
 */
export const CMS_PREFIX = __ENV.CMS_PREFIX ? __ENV.CMS_PREFIX : 'cms';

/**
 * the threshold over which to count a request as responding too slowly in ms
 *
 * @constant
 * @type {number}
 * @default 1000ms (1s)
 * @memberof environment
 */
export const THRESHOLD = __ENV.THRESHOLD ? __ENV.THRESHOLD : 1000;

/** Azure B2C related variables */

/**
 * The B2C tenant ID - returns the loadtest tenant value if not set
 *
 * @constant
 * @type {string}
 * @default 8d922fec-c1fc-4772-b37e-18d2ce6790df (loadtest tenant)
 * @memberof environment
 */
export const TENANT_ID = __ENV.TENANT_ID ? __ENV.TENANT_ID : '8d922fec-c1fc-4772-b37e-18d2ce6790df';

/**
 * the B2C Hub client ID - returns the loadtest tenant value if not set
 *
 * @constant
 * @type {string}
 * @default 24bc7c47-97c6-4f27-838e-093b3948a5ca (loadtest tenant)
 * @memberof environment
 */
export const HUB_CLIENT_ID = __ENV.HUB_CLIENT_ID ? env.HUB_CLIENT_ID : '24bc7c47-97c6-4f27-838e-093b3948a5ca';

/**
 * the B2C Auth client ID - returns the loadtest tenant value if not set
 *
 * @constant
 * @type {string}
 * @default 926001fe-7853-485d-a15e-8c36bb4acaef (loadtest tenant)
 * @memberof environment
 */
export const AUTH_CLIENT_ID = __ENV.AUTH_CLIENT_ID ? env.AUTH_CLIENT_ID : '926001fe-7853-485d-a15e-8c36bb4acaef';

/**
 * the B2C policy name - returns the loadtest tenant value if not set
 *
 * @constant
 * @type {string}
 * @default B2C_1A_RELYING_PARTY_SIGN_UP_LOG_IN (loadtest tenant)
 * @memberof environment
 */
export const POLICY_NAME = __ENV.POLICY_NAME ? __ENV.POLICY_NAME : 'B2C_1A_RELYING_PARTY_SIGN_UP_LOG_IN';

/**
 * whether to use B2C to authenticate for running test
 *
 * @constant
 * @type {boolean}
 * @default true
 * @memberof environment
 */
export const B2C = __ENV.B2C ? __ENV.B2C : true;

/**
 * the room ID used for testing Assessment service
 *
 * @constant
 * @type {string}
 * @memberof environment
 */
export const ROOM_ID = __ENV.ROOM_ID;

/** Variables related to running rate tests */

/**
 * The target rate for the test (iterations per second)
 *
 * @constant
 * @type {number}
 * @default 1
 * @memberof environment
 */
export const rate = __ENV.rate ? __ENV.rate : 1;

/**
 * Amount of VUs to start the test with
 *
 * @constant
 * @type {number}
 * @default 10
 * @memberof environment
 */
export const vus = __ENV.vus ? __ENV.vus : 10;

/**
 * how long to run the test for expressed as a number followed by unit (e.g. 30s, 1m, 1h)
 *
 * @constant
 * @type {string}
 * @default 1m
 * @memberof environment
 */
export const duration = __ENV.duration ? __ENV.duration : '1m';

/**
 * the maximum number of logged in users in a user pool
 *
 * @constant
 * @type {number}
 * @default 500
 * @memberof environment
 */
export const poolCap = __ENV.poolCap ? __ENV.poolCap : 500;