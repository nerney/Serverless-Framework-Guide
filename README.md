# Serverless Framework

The Serverless Framework is a free and open source platform agnostic CLI tool for building, deploying, and monitoring serverless applications featuring event-driven, pay-per-execution lambda functions. Its beauty is that it lets you orchestate a variety of cloud resources without having to enter the management console. You may choose to use a number of different cloud providers with Serverless, such as Google Cloud Platform, Azure, or OpenWhisk. For our project, we went with AWS.

Under the hood, Serverless uses AWS CloudFormation to handle the description and deployment of our serverless resources. You will still need to be able to write some CloudFormation, as not everything is abstracted away by Serverless, but it vastly simplifies the process of describing your functions and the events that invoke them. Let's start by taking a look at how easy it is to get started with a Serverless application.

## Prerequisites

- Node.js - `v6.5.0 or later`
- Serverless CLI - `npm i -g serverless`
- An AWS account with your provider credentials set:
  <https://serverless.com/framework/docs/providers/aws/guide/credentials/>

## Meet the Serverless CLI

The CLI allows you to choose from a collection of templates to easily get your service off the ground. In our project we used `aws-nodejs` to start.

```bash
sls create --template aws-nodejs --path hello-world
cd hello-world
```

This creates for us a boilerplate service using AWS Lambda with Node.js:

```bash
.gitignore
handler.js
serverless.yml
```

The `.gitignore` just has package directories and the .serverless directory, and the hello-world lambda function that is provided by the template is very straightforward (comment removed for brevity):

```bash
'use strict';

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
};
```

The real magic is in the `serverless.yml` file. It includes comments providing boilerplate for a lot of different configuration options, but for hello-world, we only need the 7 uncommented lines:

```bash
service: hello-world

provider:
  name: aws
  runtime: nodejs8.10

functions:
  hello:
    handler: handler.hello
```

With this, we can simply run:

```bash
sls deploy -v

# Serverless goes off and does its thing, and we see the results:
service: hello-world
stage: dev
region: us-east-1
stack: hello-world-dev
api keys:
    None
endpoints:
    None
functions:
    hello: hello-world-dev-hello
```

Using the CLI we can invoke this function and return the logs produced by the invocation.

```bash
sls invoke -f hello -l

# we get back:
{
    "statusCode": 200,
    "body": "{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{}}"
}
```

Using the CLI, you can redeploy functions individually, view logs for functions, and when you want to teardown a service completely, just run `sls remove`

## Exploring `serverless.yml`
