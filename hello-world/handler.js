'use strict';

const AWS = require('aws-sdk');
const DBClient = new AWS.DynamoDB.DocumentClient();
const TABLENAME = 'requests';

module.exports.hello = async event => {
  const rightNow = ''.concat(Date.now());
  const request = {
    id: rightNow,
    event: event
  };

  try {
    let result = await DBClient.put({
      TableName: TABLENAME,
      Item: request
    }).promise();
    return {
      statusCode: 200,
      body: result
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: err
    };
  }
};
