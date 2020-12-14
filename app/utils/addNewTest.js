'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, phone, description) {

	try {

		// Reference
		let objContract
		let dataBuffer
		let data

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		let txObject = await objContract.createTransaction('addNewTest')
		let txId = txObject.getTransactionID()
		dataBuffer = await txObject.submit(testId, phone, description);

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		data = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Add Tx to reponse
		data["txId"] = txId._transaction_id

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
