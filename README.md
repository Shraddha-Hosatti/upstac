# UPSTAC Blockchain Network

UPSTAC Blockchain Network is built on hyperledger 1.4.3 and has below network architecture :

* 4 Organizations (HospitalA, HospitalB, Government, Insurance)
* 2 Peers for HospitalA
* 2 Peers for HospitalB
* 2 Peer for Government
* 1 Peer for insurance
* TLS enabled
* Common channel(common) between hospitalA, hospitalB, Government and Insurance
* Common chaincode(common) between hospitalA, hospitalB, Government and Insurance
* Private channel(insurance-hospitala) between hospitalA and Insurance
* Private chaincode(insure) between hospitalA and Insurance

## Prerequisites

### Docker

Reference : https://docs.docker.com/engine/install/ubuntu/

```
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose
sudo docker run hello-world
```

### NodeJS

```
cd $HOME
mkdir tmp
cd $HOME/tmp
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
```

### Hyperledger Images

```
cd $HOME
mkdir tmp
cd $HOME/tmp
docker pull hyperledger/fabric-ccenv:1.4.3
docker tag hyperledger/fabric-ccenv:1.4.3 hyperledger/fabric-ccenv:latest
```

## One Step Network Setup

Run Below command in network folder

### Start all

This will Start the whole network

`./startAll.sh`

### Stop all

This will Stop the whole network

`./stopAll.sh`

## Network Setup (Step Wise)

Run Below command in network folder

### Setup HospitalA, HospitalB and Government

This will create artifacts and run docker images for HospitalA, HospitalB and Government

`./network.sh up`

If you are starting your network for the second time please run below command first

`./network.sh down`

### Chaincode Installation and Instantiation

This will install and instantiate chaincode(common).

`./network.sh install`

### Add Insurance org to common channel

Update version to new chaincode version in insurance-network.sh

Example : VERSION=2.0

`./insurance-network.sh up`

### Create Private channel with hospitalA

This will create private channel via HospitalA and add Insurance to that channel and install chaincode(insure)

`./insurance-network.sh createPrivateChannel`

## Network Maintainance

Run Below command in network folder

### Stop HospitalA, HospitalB and Government

This will create artifacts and run docker images for HospitalA, HospitalB and Government

`./network.sh down`

Important : Use this command in order to shut down the network and restart it, directly deleting dockers can cause issues.

### Stop Insurance

This will create artifacts and run docker images for HospitalA, HospitalB and Government

`./insurance-network.sh down`

Important : Use this command in order to shut down the network and restart it, directly deleting dockers can cause issues.

### Update chaincode common (Optional)

Update VERSION_NO to new chaincode Version in network.sh

Example : VERSION_NO=1.2

`./network.sh update`

### Update private chaincode

Go to updatePrivateChainCode function in ./insurance-network.sh and update VERSION_NO to next version

Example : VERSION_NO=2.0

`./insurance-network.sh updatePrivateChainCode`

### Update common channel code after insurance joined

Go to updateCommonWithInsurance function in ./network.sh and update VERSION_NO to next version

Example : VERSION_NO=5.1

`./network.sh updateCommonWithInsurance`

### Add new insurance peer on common channel

Update VERSION_NO to current chaincode version of common channel in ./insurance-network.sh

Example : VERSION_NO=2.0

`./insurance-network.sh addNewPeer`

#### Verify 

```
docker exec -it peer1.insurance.upstac.com bash

peer channel list

peer chaincode query -o orderer.upstac.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/upstac.com/orderers/orderer.upstac.com/msp/tlscacerts/tlsca.upstac.com-cert.pem -C common -n common --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/insurance.upstac.com/peers/peer1.insurance.upstac.com/tls/ca.crt -c '{"Args":["org.upstac.user:getUserDetails","44"]}'
```

### Remove Peer 

Example for removing peer1.insurance.upstac.com.

```
docker stop peer1.insurance.upstac.com
docker rm peer1.insurance.upstac.com
```

### Remove Insurance Organization from common channel

`./insurance-network.sh removeInsuranceFromCommonChannel`

After removing Organization, organization will stop getting new data

## Rest API for Blockchain

#### Import Postman

Import below URL in Postman (Go to Import -> Import from Link)

https://www.getpostman.com/collections/4304b0968443e983454e

#### APIs are in app folder

`cd app`

#### Install dependency

`sudo npm i`

#### Run Project

`node index.js`

#### Connection Profiles

Connection Profile is required to do transaction on blockchain via different peers. These files are present in app/blockchain/connectionProfile folder for each organization.

#### Register Fabric Admin to CA

Replace certificatePath and privateKeyPath based on your system

```
API : <BaseURL>/<org>/registerAdmin
```

#### Enroll New Fabric User 

```
API : <BaseURL>/<org>/registerUser
```

Users Credentails can found in "identity" folder inside the app/blockchain/identity/<org>

Important : Delete this folder while restarting the network.

#### Add Existing Fabric User(User1) to Wallet 

Replace certificatePath and privateKeyPath based on your system

```
API : <BaseURL>/<org>/addToWallet
```

#### Interact with blockchain

Now you can interact with the blockchain with the registered user Name.

#### Revoke Existing Fabric User 

```
API : <BaseURL>/<org>/revokeUser
```

#### Update below in upstac backend 

In application.properties

```
blockchain.use  -> true/false
blockchain.baseURL -> to organization base URL
blockchain.fabricUserName -> to organization enrolled user 
```

## Troubleshooting

#### Enter Docker

```
docker exec -it <container_name> bash
Example : docker exec -it peer0.hospitalA.upstac.com bash
```

#### Check Docker Logs

```
docker logs -f <container_name>
Example : docker logs -f peer0.hospitalA.upstac.com
```

#### Query Chain code example

Go inside any peer using above command

`peer chaincode query -o orderer.upstac.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/upstac.com/orderers/orderer.upstac.com/msp/tlscacerts/tlsca.upstac.com-cert.pem -C common -n common --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/insurance.upstac.com/peers/peer1.insurance.upstac.com/tls/ca.crt -c '{"Args":["org.upstac.user:getUserDetails","44"]}'`

#### Stop / remove all of Docker containers:

Sometimes docker cache previous images, below commands can be used to clear everything from docker. 

Use them as per your current system since it can remove all images.

```
docker volume prune -f
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker images -a | grep "upstac" | awk '{print $3}' | xargs docker rm -f
docker images -a | grep "upstac" | awk '{print $3}' | xargs docker rmi -f
docker images -a | xargs docker rmi
docker system prune -a
```

#### CCENV Error 
docker build: Failed to pull hyperledger/fabric-ccenv:latest: API error (404): manifest for hyperledger/fabric-ccenv:latest not found: manifest unknown: manifest unknown
```
docker pull hyperledger/fabric-ccenv:1.4.3
docker tag hyperledger/fabric-ccenv:1.4.3 hyperledger/fabric-ccenv:latest
```