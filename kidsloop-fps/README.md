# K6 Tests for File Processing Service

## Setup
In order to run the tests, you will need the following:
* AWS Session credentials for `KLMultiAccountAssumeRole` in the AWS account you are testing (via https://d-9b6720b659.awsapps.com/start#/)
* Confirm that the Redis key `kfps:attachment` is empty
* Restart any pods / ECS Tasks to ensure that they are in a clean state to start

## Running tests

Run:
```
export AWS_ACCESS_KEY_ID=XXXxxxXXX
export AWS_SECRET_ACCESS_KEY=XXXxxXXX
export AWS_SESSION_TOKEN=XXXxxxXXX

k6 run student-upload.js -e INPUT_BUCKET=<in bucket> [-e OUTPUT_BUCKET=<out bucket>] -e VUS=<n>
```

If the input bucket is the same as the output bucket, that can be omitted.
