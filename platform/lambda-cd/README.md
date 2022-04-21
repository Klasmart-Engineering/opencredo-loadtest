# Update Deployment Lambda

This folder contains a lambda function that is driven by AWS EventBridge in order to update an EKS deployment based on ECR image scans and emit an AWS EventBridge based event.

It is written in Go using the [AWS SDK V2](https://aws.github.io/aws-sdk-go-v2/docs/) to interact with EKS and EventBridge services and [AWS IAM Authenticator](https://github.com/kubernetes-sigs/aws-iam-authenticator) to authenticate with the EKS Cluster. Interaction is then using [client-go](https://github.com/kubernetes/client-go) to update kubernetes resources.

The event can be configured with a lambda destination or can be emitted in code, this is configured using environment variables in the SAM template

The codebase lives in the `update-deployment` folder, including the schema for the incoming event.

## Build

This function is built using the AWS Serverless Application Model and the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html). This will need to be setup in order to build and deploy.

```bash
sam build
```

## Testing

There are a few ways of invoking the function, building and deploying available with SAM, pre deployment you can run a local invocation - an example event is stored in `events/event.json`. For local or remote invocation you should ensure you have an up to date build.

```bash
# Local invocation test - uses the current AWS credentials in your shell session (either SSO or with Key/ID)
sam local invoke -e events/event.json

# To test deployment and watch your local changes to templates/code (still in beta)
sam sync --stack-name update-deployment --watch

# To invoke the deployed function
### note fileb:// in the payload which loads the file as a blob meaning you don't need to encode it
aws lambda invoke --function-name loadtest-userService-update-deployment --payload fileb://events/event.json output.txt
```

## Deploy

Deployment is using AWS SAM, a folder called `.aws-sam` is created that stores build artifacts, dependencies, cloudformation templates, and configuration. This is all auto-generated and is set to be ignored. The two main files for managing sam are `samconfig.toml` for configuring the sam CLI and `template.yaml` for configuring the application stack.

```bash
sam deploy
```