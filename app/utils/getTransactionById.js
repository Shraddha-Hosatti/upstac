'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, txId) {

	try {

		// Get Channel
		var channel = await helper.getChannel(org, fabricUserName, channelName)
		
		// Get Tx Data
		let data = await channel.queryTransaction(txId);

		if (data) {
			return data;
		} else {
			throw Error("No Data Found")
		}

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
