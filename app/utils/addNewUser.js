'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName, role, firstName, lastName, gender, dob, phone, email, address, pinCode) {

	try {

		// Reference
		let objContract
		let newUserBuffer
		let newUser

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);
		
		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		let txObject = await objContract.createTransaction('addNewUser')
		let txId = txObject.getTransactionID()
		newUserBuffer = await txObject.submit(role, firstName, lastName, gender, dob, phone, email, address, pinCode);
		
		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		console.log(newUserBuffer.toString())
		newUser = JSON.parse(newUserBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Add Tx to reponse
		newUser["txId"] = txId._transaction_id

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
