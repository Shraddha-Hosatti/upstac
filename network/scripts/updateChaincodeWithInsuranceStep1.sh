#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Updating Chaincode On Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="common"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="hospitalA hospitalB government"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "New Version : "$VERSION

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 of all 3 orgs making them endorsers
echo "Installing chaincode on peer0.hospitalA.upstac.com ..."
installChaincode 0 'hospitalA' $VERSION
echo "Installing chaincode on peer1.hospitalA.upstac.com ..."
installChaincode 1 'hospitalA' $VERSION
echo "Installing chaincode on peer0.hospitalB.upstac.com ..."
installChaincode 0 'hospitalB' $VERSION
echo "Installing chaincode on peer1.hospitalB.upstac.com ..."
installChaincode 1 'hospitalB' $VERSION
echo "Installing chaincode on peer0.government.upstac.com ..."
installChaincode 0 'government' $VERSION
echo "Installing chaincode on peer1.government.upstac.com ..."
installChaincode 1 'government' $VERSION


echo
echo "========= All GOOD, Chaincode Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0