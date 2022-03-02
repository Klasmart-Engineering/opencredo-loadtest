'use strict';
const querystring = require('querystring');
const jwt  = require('jsonwebtoken');

const issuers = new Map();

issuers.set('kidsloop', {
    options: {
        issuer: 'kidsloop',
        algorithms: ['RS512']
    },
    secretOrPublicKey: [ '-----BEGIN PUBLIC KEY-----',
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxdHMYTqFobj3oGD/JDYb',
        'DN07icTH/Dj7jBtJSG2clM6hQ1HRLApQUNoqcrcJzA0A7aNqELIJuxMovYAoRtAT',
        'E1pYMWpVyG41inQiJjKFyAkuHsVzL+t2C778BFxlXTC/VWoR6CowWSWJaYlT5fA/',
        'krUew7/+sGW6rjV2lQqxBN3sQsfaDOdN5IGkizsfMpdrETbc5tKksNs6nL6SFRDe',
        'LoS4AH5KI4T0/HC53iLDjgBoka7tJuu3YsOBzxDX22FbYfTFV7MmPyq++8ANbzTL',
        'sgaD2lwWhfWO51cWJnFIPc7gHBq9kMqMK3T2dw0jCHpA4vYEMjsErNSWKjaxF8O/',
        'FwIDAQAB',
        '-----END PUBLIC KEY-----'].join('\n')
});

issuers.set('kl2-h5p', {
    options: {
        issuer: 'kl2-h5p',
        algorithms: ['RS512']
    },
    secretOrPublicKey: [
        '-----BEGIN PUBLIC KEY-----',
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsq6fWM27ag9FZ4NPREnL',
        'RTlD7iCvyb85qhHETG23+4k+/tYXvxbNgiqL9/5GqhzPo7NWKl9crDKmGAh3g97h',
        'S9m+Rm4oXkBLhhg3Y2BfZpdi63mgDZepKXGJIAS2msA+VRcfg/CaRloYZ1DqwmWr',
        '4bkvUYTfs4498Nyl8RJ5xgICyjstVG2mzreDHv4cIy8bLrUzP0H2OSdDbWBTVm9j',
        '0rDqDEEWqQKMdVokmO/MtrV0OxlBrgixDlvPrjVlNUA9bVFGySXMU4Zyw1XAujo4',
        'oSAO221X0GIuL3VeC/U9u7jhRMdGtA7Fvx3W8/qWmgNG0UaXDAAHjyl3NctinLE5',
        'RQIDAQAB',
        '-----END PUBLIC KEY-----'].join('\n')
});
issuers.set('calmid-debug', {
    options: {
        issuer: 'calmid-debug',
        algorithms: ['HS512', 'HS384', 'HS256']
    },
    secretOrPublicKey: 'iXtZx1D5AqEB0B9pfn+hRQ=='
});


//Response when JWT is not valid.
const response401 = {
    status: '401',
    statusDescription: 'Unauthorized'
};

exports.handler = (event, context, callback) => {

    const request = event.Records[0].cf.request;

    /* Parse request querystring to get javascript object */
    const params = querystring.parse(request.querystring);

    // If no JWT token, then generate HTTP redirect 401 response.
    if(!params.jwt) {
        console.log("Error: No JWT in the querystring");
        return callback(null, response401);
    }

    var jwtToken = params.jwt;

    try {
        const payload = jwt.decode(jwtToken);
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid payload format');
        }
        const issuer = payload.iss;
        if (!issuer || typeof issuer !== 'string') {
            throw new Error('Issuer must be a string');
        }

        // const issuerOptions = verifyOptions;
        const issuerOptions = issuers.get(issuer);
        if (!issuerOptions) {
            throw new Error(`Unknown Issuer(${issuer})`);
        }

        var legit = jwt.verify(jwtToken, issuerOptions.secretOrPublicKey, issuerOptions.options);
        console.log("\nJWT verification result: " + JSON.stringify(legit));
    } catch(e) {
        console.log(e);
        return callback(null, response401);
    }

    // Continue request processing if authentication passed
    callback(null, request);
};
