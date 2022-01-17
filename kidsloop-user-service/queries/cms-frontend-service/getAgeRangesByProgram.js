import http from 'k6/http';

 export const query = `query($program_id: ID!) {
    program(id: $program_id) {
        age_ranges {
            id
            name
            status
            system
        }
    }
}`;

export function getAgeRangesByProgram(userEndpoint, headers, program_id) {
    response = http.post(userEndpoint, JSON.stringify({
      query: query,
      operationName: 'getAgeRangesByProgram',
    }), {
      headers: headers
    });

    return response;
}

export default function main(data) {
    return getAgeRangesByProgram(data.userEndpoint, data.headers, data.program_id)
}