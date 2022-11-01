'use strict';

const { DynamoDB } = require('aws-sdk')

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new DynamoDB.DocumentClient()
const params = {
  TableName: USERS_TABLE,
};

module.exports.list = (event, context, callback) => {
  // fetch all todos from the database
  // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the user list.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
    callback(null, response);
  });
};
