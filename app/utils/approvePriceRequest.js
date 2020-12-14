'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, price) {

	try {

		// Reference
		let objContract		
		let data
		let dataBuffer

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....View data on the Network');
		let txObject = await objContract.createTransaction('approvePriceRequest')
		let txId = txObject.getTransactionID()
		dataBuffer = await txObject.submit(testId, price);

		// Process response
		console.log('.....Processing Transaction  \n\n');
		data = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Processing Complete!');

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
