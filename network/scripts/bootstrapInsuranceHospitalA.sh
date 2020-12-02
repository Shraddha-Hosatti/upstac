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
    peer channel create -o orderer.upstac.com:7050 --ordererTLSHostnameOverride orderer.upstac.com -c $CHANNEL_NAME -f ./channel-artifacts/channelInsurance.tx >&log.txt    
    res=$?
    set +x
  else
    set -x
    peer channel create -o orderer.upstac.com:7050 --ordererTLSHostnameOverride orderer.upstac.com -c $CHANNEL_NAME -f ./channel-artifacts/channelInsurance.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Channel creation failed"
  echo "===================== Channel '$CHANNEL_NAME' created ===================== "
  echo
}

createChannel
joinChannelWithRetryInsurance 0 'hospitalA' $VERSION
joinChannelWithRetryInsurance 1 'hospitalA' $VERSION

# Update Anchor Peers
setGlobals 0 'hospitalA'
peer channel fetch config config_block.pb -o orderer.upstac.com:7050 --ordererTLSHostnameOverride orderer.upstac.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq .data.data[0].payload.data.config config_block.json > config.json
cp config.json config_copy.json
jq '.channel_group.groups.Application.groups.hospitalAMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.hospitalA.upstac.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output config_update.pb
configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"insurance-hospitala", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb
peer channel update -f config_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.upstac.com:7050  --ordererTLSHostnameOverride orderer.upstac.com --tls --cafile $ORDERER_CA

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
