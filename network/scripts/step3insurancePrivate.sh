#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# This script is designed to be run in the cli container as the third
# step of the insurance-network tutorial. It installs the chaincode as version 2.0
# on peer0.hospitalA and peer0.hospitalB, and uprage the chaincode on the
# channel to version 2.0, thus completing the addition of insurance to the
# network previously setup in the network tutorial.
#

echo
echo "========= Finish adding insurance to your first network ========= "
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

echo "===================== Installing chaincode 1.0 on hospitalA ===================== "
installChaincodeInsurance 0 "hospitalA" $VERSION
installChaincodeInsurance 1 "hospitalA" $VERSION

echo "===================== Upgrading chaincode on hospitalA ===================== "
instantiateChaincodeInsurance 0 "hospitalA" $VERSION

echo
echo "========= Finished adding insurance to your first network! ========= "
echo

exit 0
