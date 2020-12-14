'use strict';

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")

async function main(org, certificatePath, privateKeyPath, fabricUserName, mspName) {

	// Main try/catch block
	try {

		// A wallet is a filesystem path that stores a collection of Identities
		const wallet = new FileSystemWallet(getIdentityPath(org));

		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();

		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identity = X509WalletMixin.createIdentity(mspName, certificate, privatekey); // 'registrarMSP'

		await wallet.import(fabricUserName, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}


module.exports.execute = main;
