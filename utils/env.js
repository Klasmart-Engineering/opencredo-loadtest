export const APP_URL = __ENV.APP_URL //string
export const APP_URL_TEST = __ENV.APP_URL_TEST //string
export const USERNAME = __ENV.USERNAME //string
export const AMSENV = __ENV.AMSENV //string
export const TESTVAL = __ENV.test //string
export const PASSWORD = __ENV.PASSWORD //string
//This should be a JWT string
export const ACCESS_COOKIE = __ENV.ACCESS_COOKIE //string
export const CMS_PREFIX = __ENV.CMS_PREFIX ? __ENV.CMS_PREFIX : 'cms' //string
export const THRESHOLD = __ENV.THRESHOLD //integer

//Azure B2C
export const TENANT_ID = __ENV.TENANT_ID //string
export const HUB_CLIENT_ID = __ENV.HUB_CLIENT_ID //string
export const AUTH_CLIENT_ID = __ENV.AUTH_CLIENT_ID //string
export const POLICY_NAME = __ENV.POLICY_NAME //string
// Whether to use B2C to authenticate for tests
export const B2C = __ENV.B2C ? __ENV.B2C : false //boolean
export const B2C_URL = __ENV.B2C_URL ? __ENV.B2C_URL : __ENV.APP_URL

//Assessment
export const ROOM_ID = __ENV.ROOM_ID //string

//Rate testing
export const rate = __ENV.rate ? __ENV.rate : 1;
export const vus = __ENV.vus ? __ENV.vus : 10;
export const duration = __ENV.duration ? __ENV.duration : '1m';
export const poolCap = __ENV.poolCap ? __ENV.poolCap : 500;