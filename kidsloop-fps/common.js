export const defaultOptions = {
  vus: 1,
  iterations: 1,
  ext: {
    loadimpact: {
      projectID: 3560234,
    }
  },
};

export function isRequestSuccessful(request) {
  if (request.status !== 200) {
    console.error(request.status)
    console.error(JSON.stringify(request.body))
  }
};