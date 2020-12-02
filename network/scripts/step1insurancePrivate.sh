#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# This script is designed to be run in the insurancecli container as the
# first step of the insurance-network tutorial.  It creates and submits a
# configuration transaction to add insurance to the network previously
# setup in the network tutorial.
#

CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
: ${CHANNEL_NAME:="insurance-hospitala"}
: ${DELAY:="3"}
: ${LANGUAGE:="node"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=5

CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"

# import utils
. scripts/utils.sh

echo
echo "========= Creating config transaction to add insurance to network =========== "
echo

echo "Installing jq"
apt-get -y update && apt-get -y install jq

# Fetch the config for the channel, writing it to config.json
fetchChannelConfig ${CHANNEL_NAME} config.json

# Modify the configuration to append the new org
set -x
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"insuranceMSP":.[1]}}}}}' config.json ./channel-artifacts/insurance.json > modified_config.json
set +x

# Compute a config update, based on the differences between config.json and modified_config.json, write it as a transaction to insurance_update_in_envelope.pb
createConfigUpdate ${CHANNEL_NAME} config.json modified_config.json insurance_update_in_envelope.pb

echo
echo "========= Config transaction to add insurance to network created ===== "
echo

echo "Signing config transaction"
echo
signConfigtxAsPeerOrg "hospitalA" insurance_update_in_envelope.pb

echo
echo "========= Submitting transaction from  peer (peer0.hospitalA) which also signs it ========= "
echo
setGlobals 0 "hospitalA"
set -x
peer channel update -f insurance_update_in_envelope.pb -c ${CHANNEL_NAME} -o orderer.upstac.com:7050 --tls --cafile ${ORDERER_CA}
set +x


echo
echo "========= Config transaction to add insurance to network submitted! =========== "
echo

exit 0
