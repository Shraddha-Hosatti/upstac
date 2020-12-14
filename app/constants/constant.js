const config = require("../config/config")

function getIdentityPath(org){
    return config.path.identity + org
}

function getConnectionProfilePath(org){
    return config.path.connectionProfile + org + '.yaml'
}


module.exports = {
    getIdentityPath,
    getConnectionProfilePath
}