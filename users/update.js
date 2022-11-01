'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const USERS_TABLE = process.env.USERS_TABLE
const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.update = (event, context, callback) => {
	const timestamp = new Date().getTime()
	const userId = event.pathParameters.id
	if (!userId) {
		console.error('Validation Failed')
		callback(new Error('User id is missing.'))
		return
	}
	const data = JSON.parse(event.body)

	// Validating
	dynamoDb.get(
		{
			TableName: USERS_TABLE,
			Key: {
				userId,
			},
		},
		(error, result) => {
			// handle potential errors
			if (error) {
				console.error(error)
				callback(error)
				return
			}

			if (!result?.Item) {
				callback(null, {
					statusCode: 404,
					headers: { 'Content-Type': 'text/plain' },
					body: 'User id not found.',
				})
				return
			}

			const params = {
				TableName: USERS_TABLE,
				Key: {
					userId,
				},
				ExpressionAttributeNames: {
					'#name': 'name',
				},
				ExpressionAttributeValues: {
					':name': data.name,
					':updatedAt': timestamp,
				},
				UpdateExpression: 'SET #name = :name, updatedAt = :updatedAt',
				ReturnValues: 'ALL_NEW',
			}

			// update the todo in the database
			dynamoDb.update(params, (error, result) => {
				// handle potential errors
				if (error) {
					console.error(error)
					callback(null, {
						statusCode: error.statusCode || 501,
						headers: { 'Content-Type': 'text/plain' },
						body: "Couldn't fetch the user.",
					})
					return
				}

				// create a response
				const response = {
					statusCode: 200,
					body: JSON.stringify(result.Attributes),
				}
				callback(null, response)
			})
		}
	)
}
