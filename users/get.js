'use strict';

const { DynamoDB } = require('aws-sdk')

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new DynamoDB.DocumentClient()


module.exports.get = (event, context, callback) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the user.',
      });
      return;
    }

    // create a response
    const response = result.Item
			? {
					statusCode: 200,
					body: JSON.stringify(result.Item),
			  }
			: {
					statusCode: 404,
					headers: { 'Content-Type': 'text/plain' },
					body: "User not found.",
			  }
    callback(null, response);
  });
};