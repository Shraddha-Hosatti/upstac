const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;


async function getContractInstance(fabricUserName, channelName, chainCodeName, smartContractName) {
	
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-iit.yaml
	gateway = new Gateway();
	
	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user USERS_ADMIN was initially added to this wallet.
	const wallet = new FileSystemWallet('./identity');
		
	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile.yaml', 'utf8'));
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};
	
	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access channel
	console.log('.....Connecting to channel - common');
	const channel = await gateway.getNetwork(channelName);
	
	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to Smart Contract');
	return channel.getContract(chainCodeName, smartContractName);
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;