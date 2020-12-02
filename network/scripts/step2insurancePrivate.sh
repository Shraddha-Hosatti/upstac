#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# This script is designed to be run in the insurancecli container as the
# second step of the insurance-network tutorial. It joins the insurance peers to the
# channel previously setup in the network tutorial and install the
# chaincode as version 2.0 on peer0.insurance.
#

echo
echo "========= Getting insurance on to your first network ========= "
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
VERSION="$6"
: ${CHANNEL_NAME:="insurance-hospitala"}
: ${DELAY:="3"}
: ${LANGUAGE:="node"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${VERSION:="1.0"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=5
CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"

# import utils
. scripts/utils.sh

echo "Fetching channel config block from orderer..."
set -x
peer channel fetch 0 $CHANNEL_NAME.block -o orderer.upstac.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res "Fetching config block from orderer has Failed"

joinChannelWithRetryInsurance 0 insurance
echo "===================== peer0.insurance joined channel '$CHANNEL_NAME' ===================== "

setGlobals 0 'insurance'
peer channel fetch config config_block.pb -o orderer.upstac.com:7050 --ordererTLSHostnameOverride orderer.upstac.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq .data.data[0].payload.data.config config_block.json > config.json
cp config.json config_copy.json
jq '.channel_group.groups.Application.groups.insuranceMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.insurance.upstac.com","port": 21051}]},"version": "0"}}' config_copy.json > modified_config.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"insurance-hospitala", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.upstac.com:7050  --ordererTLSHostnameOverride orderer.upstac.com --tls --cafile $ORDERER_CA

echo "Installing chaincode on peer0.insurance..."
installChaincodeInsurance 0 'insurance' $VERSION

echo
echo "========= insurance is now halfway onto your first network ========= "
echo

exit 0
