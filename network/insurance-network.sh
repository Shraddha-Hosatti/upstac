#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script extends the Hyperledger Fabric By Your First Network by
# adding a third organization to the network previously setup in the
# network tutorial.
#

# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries
# this may be commented out to resolve installed version of tools if desired
export PATH=${PWD}/bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export VERBOSE=false

# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  insurance-network.sh up|down|restart|generate [-c <channel name>] [-t <timeout>] [-d <delay>] [-f <docker-compose-file>] [-s <dbtype>]"
  echo "  insurance-network.sh -h|--help (print this message)"
  echo "    <mode> - one of 'up', 'down', 'restart' or 'generate'"
  echo "      - 'up' - bring up the network with docker-compose up"
  echo "      - 'down' - clear the network with docker-compose down"
  echo "      - 'restart' - restart the network"
  echo "      - 'generate' - generate required certificates and genesis block"
  echo "    -c <channel name> - channel name to use (defaults to \"common\")"
  echo "    -t <timeout> - CLI timeout duration in seconds (defaults to 10)"
  echo "    -d <delay> - delay duration in seconds (defaults to 3)"
  echo "    -f <docker-compose-file> - specify which docker-compose file use (defaults to docker-compose-cli.yaml)"
  echo "    -s <dbtype> - the database backend to use: goleveldb (default) or couchdb"
  echo "    -l <language> - the chaincode language: golang (default) or node"
  echo "    -i <imagetag> - the tag to be used to launch the network (defaults to \"latest\")"
  echo "    -v - verbose mode"
  echo
  echo "Typically, one would first generate the required certificates and "
  echo "genesis block, then bring up the network. e.g.:"
  echo
  echo "	insurance-network.sh generate -c common"
  echo "	insurance-network.sh up -l node"
  echo "	insurance-network.sh down -c common"
  echo
  echo "Taking all defaults:"
  echo "	insurance-network.sh generate"
  echo "	insurance-network.sh up"
  echo "	insurance-network.sh down"
}

# Ask user for confirmation to proceed
function askProceed () {
  read -p "Continue? [Y/n] " ans
  case "$ans" in
    y|Y|"" )
      echo "proceeding ..."
    ;;
    n|N )
      echo "exiting..."
      exit 1
    ;;
    * )
      echo "invalid response"
      askProceed
    ;;
  esac
}

# Obtain CONTAINER_IDS and remove them
# TODO Might want to make this optional - could clear other containers
function clearContainers () {
  CONTAINER_IDS=$(docker ps -aq)
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

# Delete any images that were generated as a part of this setup
# specifically the following images are often left behind:
# TODO list generated image naming patterns
function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images|awk '($1 ~ /dev-peer.*.common.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Generate the needed certificates, the genesis block and start the network.
function networkUp () {
  # generate artifacts if they don't exist
  if [ ! -d "insurance-artifacts/crypto-config" ]; then
    generateCerts
    generateChannelArtifacts
    createConfigTx
  fi

  IMAGE_TAG=$IMAGETAG docker-compose -f $COMPOSE_FILE_INSURANCE up -d 2>&1

  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start insurance network"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "############### Have insurance peers join network ##################"
  echo "###############################################################"
  docker exec insurancecli ./scripts/step2insurance.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE $VERSION
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to have insurance peers join network"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "##### Upgrade chaincode to have insurance peers on the network #####"
  echo "###############################################################"
  docker exec cli ./scripts/step3insurance.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE $VERSION
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to add insurance peers on network"
    exit 1
  fi

}

# Tear down running network
function networkDown () {
  docker-compose -f "$COMPOSE_FILE_INSURANCE" down --volumes # --remove-orphans
  rm -rf ./insurance-artifacts/crypto-config/ channel-artifacts/insurance.json

  # Don't remove containers, images, etc if restarting
  # if [ "$MODE" != "restart" ]; then
  #   #Cleanup the chaincode containers
  #   clearContainers
  #   #Cleanup images
  #   removeUnwantedImages
  #   # remove orderer block and other channel configuration transactions and certs
  #   rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config ./insurance-artifacts/crypto-config/ channel-artifacts/insurance.json
  #   # remove the docker-compose yaml file that was customized to the example
  #   rm -f docker-compose-e2e.yaml
  # fi
}

# Use the CLI container to create the configuration transaction needed to add
# insurance to the network
function createConfigTx () {
  echo
  echo "###############################################################"
  echo "####### Generate and submit config tx to add insurance #############"
  echo "###############################################################"
  docker exec cli scripts/step1insurance.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to create config tx"
    exit 1
  fi
}

# We use the cryptogen tool to generate the cryptographic material
# (x509 certs) for the new org.  After we run the tool, the certs will
# be parked in the network folder titled ``crypto-config``.

# Generates insurance certs using cryptogen tool
function generateCerts (){
  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "##### Generate insurance certificates using cryptogen tool #########"
  echo "###############################################################"

  (cd insurance-artifacts
   set -x
   cryptogen generate --config=./insurance-crypto.yaml
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate certificates..."
     exit 1
   fi
  )
  echo
}

# Generate channel configuration transaction
function generateChannelArtifacts() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi
  echo "##########################################################"
  echo "#########  Generating insurance config material ###############"
  echo "##########################################################"
  (cd insurance-artifacts
   export FABRIC_CFG_PATH=$PWD
   set -x
   configtxgen -printOrg insuranceMSP > ../channel-artifacts/insurance.json
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate insurance config material..."
     exit 1
   fi
  )
  cp -r crypto-config/ordererOrganizations insurance-artifacts/crypto-config/
  echo
}

function updatePrivateChainCode(){

  CHANNEL_NAME="insurance-hospitala"
  VERSION_NO=1.5.6
  docker exec cli scripts/updateChaincodePrivateStep1.sh "$CHANNEL_NAME" "$CLI_DELAY" "$LANGUAGE" "$VERSION_NO" "$TYPE"
  docker exec insurancecli scripts/updateChaincodePrivateStep2.sh "$CHANNEL_NAME" "$CLI_DELAY" "$LANGUAGE" "$VERSION_NO" "$TYPE"
  docker exec cli scripts/updateChaincodePrivateStep3.sh "$CHANNEL_NAME" "$CLI_DELAY" "$LANGUAGE" "$VERSION_NO" "$TYPE"

}

function createPrivateChannel(){
  CHANNEL_NAME="insurance-hospitala"
  VERSION=1.0

  configtxgen -profile OrdererGenesisInsurance -channelID $CHANNEL_NAME -outputBlock ./channel-artifacts/genesis.block -configPath ./insurance-artifacts
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi

  echo
  echo "#################################################################"
  echo "### Generating channel configuration transaction 'channel.tx' ###"
  echo "#################################################################"
  set -x
  configtxgen -profile $CHANNEL_NAME -outputCreateChannelTx ./channel-artifacts/channelInsurance.tx -channelID "$CHANNEL_NAME" -configPath ./insurance-artifacts
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi
  docker exec cli scripts/bootstrapInsuranceHospitalA.sh "$CHANNEL_NAME" "$CLI_DELAY" "$LANGUAGE" "$CLI_TIMEOUT" "$VERBOSE"

  docker exec cli scripts/step1insurancePrivate.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to create config tx"
    exit 1
  fi

  docker exec insurancecli ./scripts/step2insurancePrivate.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE $VERSION
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to have insurance peers join network"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "##### Upgrade chaincode to have insurance peers on the network #####"
  echo "###############################################################"
  docker exec cli ./scripts/step3insurancePrivate.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE $VERSION
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to add insurance peers on network"
    exit 1
  fi

}


function removeInsuranceFromCommonChannel(){
  
  echo
  echo "###############################################################"
  echo "####### Removing Insurance Organization from cmmon #############"
  echo "###############################################################"
  docker exec cli scripts/removeInsuranceOrg.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to create config tx"
    exit 1
  fi

}

function addNewPeer(){

  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi
  echo
  echo "###############################################################"
  echo "##### Generate insurance certificates using cryptogen tool #########"
  echo "###############################################################"

  (cd insurance-artifacts
   set -x
   cryptogen extend --config=./insurance-crypto-addNewPeer.yaml
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate certificates..."
     exit 1
   fi
  )
  echo

  IMAGE_TAG=$IMAGETAG docker-compose -f docker-compose-insurance-newPeer.yaml up -d 2>&1  
  docker exec insurancecli ./scripts/step1insuranceNewPeer.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE $VERSION
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to have insurance peers join network"
    exit 1
  fi

}

# If network wasn't run abort
if [ ! -d crypto-config ]; then
  echo
  echo "ERROR: Please, run network.sh first."
  echo
  exit 1
fi

# Obtain the OS and Architecture string that will be used to select the correct
# native binaries for your platform
OS_ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
# timeout duration - the duration the CLI should wait for a response from
# another container before giving up
CLI_TIMEOUT=10
#default for delay
CLI_DELAY=3
# channel name defaults to "common"
CHANNEL_NAME="common"
VERSION="2.0"
#
# use this as the default docker-compose yaml definition
COMPOSE_FILE_INSURANCE=docker-compose-insurance.yaml
COMPOSE_FILE=docker-compose-e2e.yml
# use golang as the default language for chaincode
LANGUAGE=node
# default image tag
IMAGETAG="1.4.3"

# Parse commandline args
if [ "$1" = "-m" ];then	# supports old usage, muscle memory is powerful!
    shift
fi
MODE=$1;shift
# Determine whether starting, stopping, restarting or generating for announce
if [ "$MODE" == "up" ]; then
  EXPMODE="Starting"
elif [ "$MODE" == "down" ]; then
  EXPMODE="Stopping"
elif [ "$MODE" == "restart" ]; then
  EXPMODE="Restarting"
elif [ "$MODE" == "generate" ]; then
  EXPMODE="Generating certs and genesis block for"
elif [ "$MODE" == "createPrivateChannel" ]; then
  EXPMODE="Creting Private channel with Hospital A"
elif [ "$MODE" == "updatePrivateChainCode" ]; then
  EXPMODE="Updating Private Chain Code"
elif [ "$MODE" == "removeInsuranceFromCommonChannel" ]; then
  EXPMODE="Removing Insurance from common Channel"
elif [ "$MODE" == "addNewPeer" ]; then
  EXPMODE="Adding New Peer"
else
  printHelp
  exit 1
fi
while getopts "h?c:t:d:f:s:l:i:v" opt; do
  case "$opt" in
    h|\?)
      printHelp
      exit 0
    ;;
    c)  CHANNEL_NAME=$OPTARG
    ;;
    t)  CLI_TIMEOUT=$OPTARG
    ;;
    d)  CLI_DELAY=$OPTARG
    ;;
    f)  COMPOSE_FILE=$OPTARG
    ;;
    s)  IF_COUCHDB=$OPTARG
    ;;
    l)  LANGUAGE=$OPTARG
    ;;
    i)  IMAGETAG=$OPTARG
    ;;
    v)  VERBOSE=true
    ;;
  esac
done

# Announce what was requested

  if [ "${IF_COUCHDB}" == "couchdb" ]; then
        echo
        echo "${EXPMODE} with channel '${CHANNEL_NAME}' and CLI timeout of '${CLI_TIMEOUT}' seconds and CLI delay of '${CLI_DELAY}' seconds and using database '${IF_COUCHDB}'"
  else
        echo "${EXPMODE} with channel '${CHANNEL_NAME}' and CLI timeout of '${CLI_TIMEOUT}' seconds and CLI delay of '${CLI_DELAY}' seconds"
  fi
# ask for confirmation to proceed
# askProceed

#Create the network using docker compose
if [ "${MODE}" == "up" ]; then
  networkUp
elif [ "${MODE}" == "down" ]; then ## Clear the network
  networkDown
elif [ "${MODE}" == "generate" ]; then ## Generate Artifacts
  generateCerts
  generateChannelArtifacts
  createConfigTx
elif [ "${MODE}" == "restart" ]; then ## Restart the network
  networkDown
  networkUp
elif [ "${MODE}" == "updatePrivateChainCode" ]; then 
  updatePrivateChainCode
elif [ "${MODE}" == "createPrivateChannel" ]; then
  createPrivateChannel
elif [ "${MODE}" == "removeInsuranceFromCommonChannel" ]; then 
  removeInsuranceFromCommonChannel
elif [ "${MODE}" == "addNewPeer" ]; then 
  addNewPeer
else
  printHelp
  exit 1
fi
