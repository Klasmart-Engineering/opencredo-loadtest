import http from 'k6/http';

export const query = `query ($age_id_0: ID! $age_id_1: ID!) {
    q0: age_range(id: $age_id_0) {id name status system}
    q1: age_range(id: $age_id_1) {id name status system}
 }`;

export function getAges(userEndpoint, headers, age_id_0, age_id_1) {
    response = http.post(userEndpoint, JSON.stringify({
      query: query,
      operationName: 'getAges',
    }), {
      headers: headers
    });

    return response;
}

export default function main(data) {
    return getAges(data.userEndpoint, data.headers, data.age_id_0, data.age_id_1)
}