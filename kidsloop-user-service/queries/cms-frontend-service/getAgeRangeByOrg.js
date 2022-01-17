import http from 'k6/http';

export const query = `query($org_id: ID!) {
    organization(organization_id: $org_id) {
        ageRanges {
            id
            name
            status
            system
        }
    }
}`

export function getAgeRangesByOrg(userEndpoint, headers, org_id) {
    response = http.post(userEndpoint, JSON.stringify({
      query: query,
      operationName: 'getAgeRangesByOrg',
    }), {
      headers: headers
    });

    return response;
}

export default function main(data) {
    return getAgeRangesByOrg(data.userEndpoint, data.headers, data.org_id)
}