# Update Deployment Lambda

This folder contains a lambda function that is driven by AWS EventBridge in order to update an EKS deployment based on ECR image scans and emit an AWS EventBridge based event.

It is written in Go using the [AWS SDK V2](https://aws.github.io/aws-sdk-go-v2/docs/) to interact with EKS and EventBridge services and [AWS IAM Authenticator](https://github.com/kubernetes-sigs/aws-iam-authenticator) to authenticate with the EKS Cluster. Interaction is then using [client-go](https://github.com/kubernetes/client-go) to update kubernetes resources.

The event is currently emitted in code rather than with a Lambda Destination.

The codebase lives in the `update-deployment` folder, including the schema for the incoming event.

## Build

This function is built using the AWS Serverless Application Model and the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html). This will need to be setup in order to build and deploy.

```bash
sam build
```

## Deploy

```bash
sam deploy
```