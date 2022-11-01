'use strict'

const { DynamoDB } = require('aws-sdk')

const USERS_TABLE = process.env.USERS_TABLE
const dynamoDb = new DynamoDB.DocumentClient()

module.exports.delete = (event, context, callback) => {
	const userId = event.pathParameters.id
	if (!userId) {
		console.error('Validation Failed')
		callback(new Error('User id is missing.'))
		return
	}

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

			dynamoDb.delete(
				{
					TableName: USERS_TABLE,
					Key: {
						userId: userId,
					},
				},
				(error) => {
					if (error) {
						console.error(error)
						callback(error)
						return
					}

					const response = {
						statusCode: 200,
						headers: { 'Content-Type': 'text/plain' },
						body: 'User deleted successfully.',
					}
					callback(null, response)
				}
			)

			const response = {
				statusCode: 200,
				headers: { 'Content-Type': 'text/plain' },
				body: 'User deleted successfully.',
			}
			callback(null, response)
		}
	)
}
