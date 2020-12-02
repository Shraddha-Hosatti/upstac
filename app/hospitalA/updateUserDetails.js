'use strict';
const helper = require('./contractHelper');

async function main(fabricUserName, channelName, chainCodeName, smartContractName, phone, newDetailsPayload) {

	try {

		// Reference
		let objContract
		let newUserBuffer
		let newUser

		// Create contract Instance
		objContract = await helper.getContractInstance(fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		newUserBuffer = await objContract.submitTransaction('updateUserDetails', phone, JSON.stringify(newDetailsPayload));

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		newUser = JSON.parse(newUserBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Response
		return newUser;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
