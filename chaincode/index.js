'use strict';

const UserChainCode = require('./user')
const InsuranceChainCode = require("./insurance")
module.exports.insuranceContract = InsuranceChainCode;
module.exports.usersContract = UserChainCode;
module.exports.contracts = [UserChainCode, InsuranceChainCode];