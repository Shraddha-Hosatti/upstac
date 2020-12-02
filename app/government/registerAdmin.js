/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function main(certificatePath, privateKeyPath) {
    try {

        // Create a new file system based wallet for managing identities.
        let wallet = new FileSystemWallet("./identity");        

        // Check to see if we've already enrolled the user.
        let userExists = await wallet.exists("admin");
        if (userExists) {
            throw Error('Admin Already Exists');
        }
       
        // Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
        let connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile.yaml', 'utf8'));

        // Create a new CA client for interacting with the CA.
        let caInfo = connectionProfile.certificateAuthorities['ca.government.upstac.com'];
        let caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path).toString();        
        let ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll the admin user, and import the new identity into the wallet.        
        let enrollment = await ca.enroll({ enrollmentID: 'admin',  enrollmentSecret: 'adminpw' });
        let identity = X509WalletMixin.createIdentity('governmentMSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('admin', identity);

        return true

    } catch (error) {
        console.error(error);
        throw error
    }
}

module.exports.execute = main;