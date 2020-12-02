'use strict';
const helper = require('./contractHelper');

async function main(fabricUserName, channelName, chainCodeName, smartContractName, testId, price) {

	try {

		// Reference
		let objContract		
		let data

		// Create contract Instance
		objContract = await helper.getContractInstance(fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....View data on the Network');
		data = await objContract.submitTransaction('approvePriceRequest', testId, price);

		// Process response
		console.log('.....Processing Transaction  \n\n');
		data = JSON.parse(data.toString());
		console.log('\n\n.....Processing Complete!');

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
