import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getUsersByOrg } from './getUsersByOrg.js';

export const options = defaultRateOptions;

const query = `query ($user_id_0: ID! $user_id_1: ID! $user_id_2: ID! $user_id_3: ID! $user_id_4: ID! $user_id_5: ID!) {
  q0: user(user_id: $user_id_0) {id:user_id name:user_name given_name family_name email avatar}
  q1: user(user_id: $user_id_1) {id:user_id name:user_name given_name family_name email avatar}
  q2: user(user_id: $user_id_2) {id:user_id name:user_name given_name family_name email avatar}
  q3: user(user_id: $user_id_3) {id:user_id name:user_name given_name family_name email avatar}
  q4: user(user_id: $user_id_4) {id:user_id name:user_name given_name family_name email avatar}
  q5: user(user_id: $user_id_5) {id:user_id name:user_name given_name family_name email avatar}
}`;

export function getUsers(userIDs) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      user_id_0: userIDs[0],
      user_id_1: userIDs[1],  
      user_id_2: userIDs[2],
      user_id_3: userIDs[3],
      user_id_4: userIDs[4],
      user_id_5: userIDs[5]
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const usersResp = getUsersByOrg(orgID);

  // in order to prevent repeated runs caching too much data we select 5 random users
  const shuffledUsers = usersResp.json('data.organization.memberships').sort(function() { 0.5 - Math.random()} );
  const userIDs = shuffledUsers.slice(0, 6).map(u => u["user"]["id"]);

  return {
    accessCookie: accessCookie,
    userIDs: userIDs
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getUsers(data.userIDs);
  isRequestSuccessful(response);
}