import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

const query = `query schoolsByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      class_id
      class_name
      status
      schools {
        school_id
        status
      }
    }
    schools {
      school_id
      school_name
      status
      classes {
        ...classIdNameStatus
      }
    }
  }
}

fragment classIdNameStatus on Class {
  class_id
  class_name
  status
}`;

function getSchoolsByOrganization(userEndpoint, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'schoolsByOrganization',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  }

  return getSchoolsByOrganization(data.userEndpoint, data.orgID, singleTest, data.accessCookie);
};