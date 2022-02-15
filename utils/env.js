export const APP_URL = __ENV.APP_URL //string
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

//Assessment
export const ROOM_ID = __ENV.ROOM_ID //string
