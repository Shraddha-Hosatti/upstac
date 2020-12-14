'use strict';
const path = require('path');

// Global
var config = {}
var PROJECT_DIR = path.resolve(__dirname, "..")

// Paths
config.path = {}
config.path.identity = PROJECT_DIR + '/blockchain/identity/'
config.path.connectionProfile = PROJECT_DIR + '/blockchain/connectionProfile/connection-profile-'

module.exports = config