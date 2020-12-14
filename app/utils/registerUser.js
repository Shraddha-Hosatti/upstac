/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs'); // FileSystem Library
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")

async function main(org, fabricUserName) {
    try {

        // Create a new file system based wallet for managing identities.
        let wallet = new FileSystemWallet(getIdentityPath(org));

        // Check to see if we've already enrolled the user.
        let userExists = await wallet.exists(fabricUserName);
        if (userExists) {
            throw Error('An identity for the user already exists in the wallet');
        }

         // Check to see if we've already enrolled the user.
         userExists = await wallet.exists("admin");
         if (!userExists) {
             throw Error('Please register admin first');
         }
       
        // Create a new gateway for connecting to our peer node.
        let gateway = new Gateway();
        
        // Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
        let connectionProfile = yaml.safeLoad(fs.readFileSync(getConnectionProfilePath(org), 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            wallet: wallet,
            identity: "admin",
            discovery: { enabled: false, asLocalhost: true }
        };
        
        // Connect to gateway using specified parameters
        console.log('.....Connecting to Fabric Gateway');
        await gateway.connect(connectionProfile, connectionOptions);

        // Get the CA client object from the gateway for interacting with the CA.
        let ca = gateway.getClient().getCertificateAuthority();
        let adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        let secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: fabricUserName, role:"client", attrs:[{name:"hf.Revoker", value:"true"}, {name:"hf.Registrar.Roles",  value:"client"}] }, adminIdentity);
        let enrollment = await ca.enroll({ enrollmentID: fabricUserName, enrollmentSecret: secret });
        let userIdentity = X509WalletMixin.createIdentity(org + 'MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(fabricUserName, userIdentity);
        
        return true

    } catch (error) {
        console.error(error)
        throw error;
    }
}

module.exports.execute = main;