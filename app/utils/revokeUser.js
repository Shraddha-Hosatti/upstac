/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs'); // FileSystem Library
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
var rimraf = require("rimraf");
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")


async function main(org, fabricUserName) {
    try {

        // Create a new file system based wallet for managing identities.
        let wallet = new FileSystemWallet(getIdentityPath(org));        

        // Check to see if we've already enrolled the user.
        let userExists = await wallet.exists(fabricUserName);
        if (!userExists) {
            throw Error('An identity for the user does not exists');
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

        // Revoke User        
        await ca.revoke({ enrollmentID: fabricUserName }, adminIdentity);

        // Remove Credentails
        rimraf(getIdentityPath(org) + "/" + fabricUserName, function () { console.log("done"); });        
        
        return true

    } catch (error) {
        console.error(error)
        throw error;
    }
}

module.exports.execute = main;