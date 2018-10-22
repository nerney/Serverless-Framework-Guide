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

```js
'use strict';

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    })
  };
};
```

The real magic is in the `serverless.yml` file. It includes comments providing boilerplate for a lot of different configuration options, but for hello-world, we only need the 7 uncommented lines:

```yaml
service: hello-world

provider:
  name: aws
  runtime: nodejs8.10

functions:
  hello:
    handler: handler.hello
```

With this, we can simply run:

```toml
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

```json
sls invoke -f hello -l

{
    "statusCode": 200,
    "body": "{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{}}"
}
```

Using the CLI, you can redeploy functions individually, view logs for functions, and when you want to teardown a service completely, just run `sls remove`

## Exploring `serverless.yml`

Going through the `serverless.yml` generated with `sls create` gives you an idea of the amount of configuration you can provide.

### Declare your service

```yaml
service: hello-world

# you may also fix the service to a specific version of Serverless
# frameworkVersion: "=X.X.X"
```

### The `provider` block

This is where you will provide configuration for the cloud provider you are using, as well as any global configuration for the lambda functions that are a part of your service. There is a lot here. And, you may not need to make use of many of these options, so we won't try to address them all here. The check out the full reference docs go here: [Serverless.yml Reference](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml)

To start, declare your cloud provider and the runtime for your functions.

```yaml
provider:
  name: aws
  runtime: nodejs8.10
```

Among the configuration options available here, you can provide a default memory size for your lambda functions (if the default GB is a bit more than you need). And, you can set any service-wide environment variables.

```yaml
memorySize: 256
environment:
  websiteURL: serverless.com
  defaultUsername: bobby
  defaultPass: B0$$H0$$
```

Remember, everything Serverless does is really just CloudFormation under the hood. So, your deploys need to be able to interact with AWS resources appropriately. And, it is in the `provider` block that you provide the necessary roles and permissions to your functions. One block where we can do some of this work is the `iamRoleStatements` block:

```yaml
iamRoleStatements:
  - Effect: Allow
    Action:
      - s3:*
      - sns:*
      - ec2:*
      - ses:*
    Resource: '*'
```

Here, we are providing our service the ability to access S3, SNS, EC2, and SES. So, as we move on to the next section, we know that our functions will have use of your `websiteURL`, `defaultUsername`, and `defaultPass` environment variables, will have a memory size of 256, will use the `nodejs.8.10` run in AWS lambda, and be able to access these other AWS services.

### The `functions` block

The real meat of your `serverless.yml` configuration is going to be in your `functions` block or your `resources` block, and often some combination of both. So this is where we really start to some of the cool stuff that Serverless handles for us.

You will notice that a lot of the configurables we saw in the `provider` block are present here. This is because Serverless lets you override higher-level configurations at the function level. A good example of how this plays out is with `memorySize`.
Remember, coming in, we have a global config for our functions of 256 MB. Now, we declare a couple functions like this:

```yaml
functions:
  hello:
    handler: handler.hello
    description: our hello function
  world:
    handler: handler.world
    description: world function, much older and bigger
    memorySize: 1024
    runtime: nodejs6.10
```

The `hello` function will use the global config for `memorySize` and `runtime` we used in the `provider` block. But, `world` has its own `memorySize` and `runtime` declared, so it will use those without effecting the configuration of any of our other functions.

This is cool, but it gets really cool when we get into events. Here, you are able to declare any of the events you want to have trigger your lambda functions. Serverless takes care of all the plumbing and you can just concentrate on writing the business logic.

Let's declare our `hello` function to trigger when a request is made to an API endpoint.

```yaml
functions:
  hello:
    handler: handler.hello
    description: hello from http
    events:
      - http:
          path: hello
          method: get
```

This will use the `hello` function from `handler.js` as a lambda that is triggered whenever a `GET` request is made to an APIGateway endpoint url `/hello`.

The beauty is that you don't need to do any work to create that APIGateway yourself. When you do a Serverless deploy, this is all handled for you.

Let's rewrite our `hello` function to we can test this out and see the results and add more as we go.

```js
'use strict';

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: 'HELLO'
  };
};
```

and, the full `.yml` we will deploy with

```yaml
service: hello-world
provider:
  name: aws
  runtime: nodejs8.10
  memorySize: 128
functions:
  hello:
    handler: handler.hello
    description: hello from http
    events:
      - http:
          path: hello
          method: get
```

Let's run `sls deploy` and see what we get back!

```toml
sls deploy

# aaandddd, the final results!:
service: hello-world
stage: dev
region: us-east-1
stack: hello-world-dev
api keys:
  None
endpoints:
  GET - https://pio14bs95l.execute-api.us-east-1.amazonaws.com/dev/hello
functions:
  hello: hello-world-dev-hello

Stack Outputs:
HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:XXXXXXXX:function:hello-world-dev-hello:2
ServiceEndpoint: https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/dev
ServerlessDeploymentBucketName: hello-world-dev-serverlessdeploymentbucket-XXXXXXXX
```

In `Stack Outputs`, the `Service Endpoint:` is our API Gateway endpoint. Since we configured our function to respond to get requests to `/hello`, we can do a curl and see if it's working properly, and sure enough, running `curl https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/dev/hello` responds with exactly what we expect:

```bash
HELLO
```
