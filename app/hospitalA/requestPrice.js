'use strict';
const helper = require('./contractHelper');

async function main(fabricUserName, channelName, chainCodeName, smartContractName, testId) {

	try {

		// Reference
		let objContract
		let dataBuffer
		let data

		// Create contract Instance
		objContract = await helper.getContractInstance(fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		dataBuffer = await objContract.submitTransaction('requestPrice', testId);

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		data = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Response
		return data;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
