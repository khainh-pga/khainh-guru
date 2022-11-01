'use strict'

const { DynamoDB } = require('aws-sdk')

const USERS_TABLE = process.env.USERS_TABLE
const dynamoDb = new DynamoDB.DocumentClient()

module.exports.create = (event, context, callback) => {
	const timestamp = new Date().getTime()
	const data = JSON.parse(event.body)
	if (!data.userId) {
		console.error('Validation Failed')
		callback(new Error('User id is missing.'))
		return
	}

	// Validating
	dynamoDb.get(
		{
			TableName: USERS_TABLE,
			Key: {
				userId: data.userId,
			},
		}, (error, result) => {
			// handle potential errors
			if (error) {
				console.error(error)
				callback(error)
				return
			}

			if (result?.Item) {
				callback(null, {
					statusCode: 409,
					headers: { 'Content-Type': 'text/plain' },
					body: 'User id already existed.',
				})
				return
			}

			const params = {
				TableName: USERS_TABLE,
				Item: {
					...data,
					createdAt: timestamp,
					updatedAt: timestamp,
				},
			}

			// write the todo to the database
			dynamoDb.put(params, (error, result) => {
				// handle potential errors
				if (error) {
					console.error(error)
					callback(new Error("Couldn't create the user."))
					return
				}

				// create a response
				const response = {
					statusCode: 200,
					body: JSON.stringify(params.Item),
				}
				callback(null, response)
			})
		}
	)
}
