// import k6 specific packages
import { group } from 'k6';
import http from 'k6/http';

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'

const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function teacherTest(cmsEndpoint, accessCookieData, orgID) {

    let response;

    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(cmsEndpoint, 'access', accessCookieData);
    cookieJar.set(cmsEndpoint, 'locale', 'en');
    cookieJar.set(cmsEndpoint, 'privacy', 'true');

    group('Home Page', function() {
        response = http.get(`${cmsEndpoint}/contents_folders?order_by=-create_at&org_id=${orgID}&publish_status=published`, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)

        response = http.get(`${cmsEndpoint}/assessments_summary?org_id=${orgID}`, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)

        const scheduleViewPayload = JSON.stringify({
            end_at_le: 1642636740,
            order_by: "start_at",
            page: 1,
            page_size: 20,
            start_at_ge: 1641340800,
            time_at: 0,
            time_boundary: "union",
            time_zone_offset: 0,
            view_type: "full_view",
        });
        response = http.post(`${cmsEndpoint}/schedules_time_view/list?org_id=${orgID}`, scheduleViewPayload, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)
    });
}

export function studentTest(cmsEndpoint, accessCookieData, orgID) {

    let response;

    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(cmsEndpoint, 'access', accessCookieData);
    cookieJar.set(cmsEndpoint, 'locale', 'en');
    cookieJar.set(cmsEndpoint, 'privacy', 'true');

    group('Home Page', function() {
        response = http.get(`${cmsEndpoint}/assessments_summary?org_id=${orgID}`, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)

        const scheduleViewPayload = JSON.stringify({
            end_at_le: 1642636740,
            order_by: "start_at",
            page: 1,
            page_size: 20,
            start_at_ge: 1641340800,
            time_at: 0,
            time_boundary: "union",
            time_zone_offset: 0,
            view_type: "full_view",
        });
        response = http.post(`${cmsEndpoint}/schedules_time_view/list?org_id=${orgID}`, scheduleViewPayload, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)

        response = http.get(`${cmsEndpoint}/assessments_for_student?complete_at_ge=1640252069&complete_at_le=1641461669&order_by=-complete_at&org_id=${orgID}&page=1&page_size=5&type=home_fun_study`, {
            headers: APIHeaders
        });
        isRequestSuccessful(response)
    });
}

function isRequestSuccessful(request) {
  if (request.status !== 200) {
    console.error(request.status)
    //if (request.status == 502 || request.status == 403) {
      console.error(JSON.stringify(request))
    //}
  }
}