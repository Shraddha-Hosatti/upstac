'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName) {

	try {

		// Reference
		let objContract
		let newUserBuffer
		let user

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....View Data on the Network');
		user = await objContract.evaluateTransaction('getAllUsersData');

		// Process response
		console.log('.....Processing Transaction  \n\n');
		user = JSON.parse(user.toString());
		console.log('\n\n.....Processing Complete!');

		// Response
		return user;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
