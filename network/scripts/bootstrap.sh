#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Setting Up Hyperledger Fabric Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
: ${CHANNEL_NAME:="common"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${TIMEOUT:="15"}
: ${VERBOSE:="false"}
LANGUAGE=$(echo "$LANGUAGE" | tr [:upper:] [:lower:])
COUNTER=1
MAX_RETRY=15
ORGS="hospitalA hospitalB government"  #UPDATE REQUIRED

if [ "$LANGUAGE" = "node" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

createChannel() {
  setGlobals 0 'hospitalA'
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer channel create -o orderer.upstac.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
    res=$?
    set +x
  else
    set -x
    peer channel create -o orderer.upstac.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Channel creation failed"
  echo "===================== Channel '$CHANNEL_NAME' created ===================== "
  echo
}

joinChannel() {

  for org in $ORGS; do
  # TODO : fix government has 1 peer
    for peer in 0 1; do
      joinChannelWithRetry $peer $org
      echo "===================== peer${peer}.${org}.upstac.com  joined channel '$CHANNEL_NAME' ===================== "
      sleep $DELAY
      echo
    done
  done

}

## Create channel
echo "Creating channel..."
createChannel

## Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

## Set the anchor peers for each org in the channel
echo "Updating anchor peers for hospitalA..."
updateAnchorPeers 0 'hospitalA'
echo "Updating anchor peers for hospitalB..."
updateAnchorPeers 0 'hospitalB'
echo "Updating anchor peers for government..."
updateAnchorPeers 0 'government'

echo
echo "========= All GOOD, Hyperledger Fabric Is Now Up and Running! =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
