const express = require('express');
const app = express();
const cors = require('cors');
const port = 4002;

// Import all function modules
const getUserDetails = require('./getUserDetails');
const addToWallet = require('./addToWallet');
const getTestDetails = require("./getTestDetails")
const getPatientTestDetails = require("./getPatientTestDetails")
const getAllTestData = require("./getAllTestData")
const getAllUsersData = require("./getAllUsersData")
const registerUser = require("./registerUser")
const registerAdmin = require("./registerAdmin")
const revokeUser = require("./revokeUser")
const logger = require('morgan');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Upstac App');
app.use(logger('dev'))

app.get('/', (req, res) => res.send('Hello government'));

app.post('/government/addToWallet', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath, req.body.fabricUserName, req.body.mspName).then (() => {
      
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/government/registerUser', (req, res) => {
    registerUser.execute(req.body.fabricUserName).then (() => {
      
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/government/registerAdmin', (req, res) => {
    registerAdmin.execute(req.body.certificatePath, req.body.privateKeyPath).then (() => {
      
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/government/revokeUser', (req, res) => {
    revokeUser.execute(req.body.fabricUserName).then (() => {
      
        const result = {
            status: 'success',
            message: 'User credentials revoked from wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/government/getUserDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
       
        // Blockchain Request
        data = await getUserDetails.execute(fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/government/getTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
       
        // Blockchain Request
        data = await getTestDetails.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});


app.post('/government/getPatientTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
       
        // Blockchain Request
        data = await getPatientTestDetails.execute(fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/government/getAllUsersData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        
        // Blockchain Request
        data = await getAllUsersData.execute(fabricUserName, channelName, chainCodeName, smartContractName)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/government/getAllTestData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        
        // Blockchain Request
        data = await getAllTestData.execute(fabricUserName, channelName, chainCodeName, smartContractName)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.listen(port, () => console.log(`Distributed App listening on port ${port}!`));
