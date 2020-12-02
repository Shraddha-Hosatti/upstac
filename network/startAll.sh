# Setup Initial Network Artifacts
./network.sh up

# Install common chaincode
./network.sh install

# Create Insurance artificats and join with initial network
./insurance-network.sh up

# Create Private Channel Insurance<->HospitalA and install chain code
./insurance-network.sh createPrivateChannel