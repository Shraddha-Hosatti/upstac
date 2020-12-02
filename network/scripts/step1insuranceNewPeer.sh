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
: ${CHANNEL_NAME:="common"}
: ${DELAY:="3"}
: ${LANGUAGE:="node"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${VERSION:="2.0"}
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

joinChannelWithRetry 1 insurance
echo "===================== peer0.insurance joined channel '$CHANNEL_NAME' ===================== "

echo "Installing chaincode on peer0.insurance..."
installChaincode 1 'insurance' $VERSION

echo
echo "========= insurance is now halfway onto your first network ========= "
echo

exit 0
