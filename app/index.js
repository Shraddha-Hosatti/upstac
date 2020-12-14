const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;
const logger = require('morgan');

// Import all function modules
const addNewUser = require('./utils/addNewUser');
const getUserDetails = require('./utils/getUserDetails');
const addToWallet = require('./utils/addToWallet');
const updateUserDetails = require('./utils/updateUserDetails');
const addNewTest = require('./utils/addNewTest');
const updateTestDetails = require("./utils/updateTestDetails")
const getTestDetails = require("./utils/getTestDetails")
const getPatientTestDetails = require("./utils/getPatientTestDetails")
const requestPrice = require("./utils/requestPrice")
const getAllPriceRequests = require("./utils/getAllPriceRequests")
const getPriceRequest = require("./utils/getPriceRequest")
const approvePriceRequest = require("./utils/approvePriceRequest")
const getAllTestData = require("./utils/getAllTestData")
const getAllUsersData = require("./utils/getAllUsersData")
const registerUser = require("./utils/registerUser")
const registerAdmin = require("./utils/registerAdmin")
const revokeUser = require("./utils/revokeUser")
const getTransactionById = require("./utils/getTransactionById")

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Upstac App');
app.use(logger('dev'))

app.get('/', (req, res) => res.send('Hello'));

app.post('/:org/addToWallet', (req, res) => {

    addToWallet.execute(req.params.org, req.body.certificatePath, req.body.privateKeyPath, req.body.fabricUserName, req.body.mspName).then (() => {      
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

app.post('/:org/registerUser', (req, res) => {
    registerUser.execute(req.params.org, req.body.fabricUserName).then (() => {
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

app.post('/:org/registerAdmin', (req, res) => {
    
    registerAdmin.execute(req.params.org).then (() => {
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

app.post('/:org/revokeUser', (req, res) => {
    revokeUser.execute(req.params.org, req.body.fabricUserName).then (() => {
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


app.post('/:org/addNewUser',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let role
        let firstName
        let lastName
        let gender
        let dob
        let phone
        let email
        let address
        let pinCode
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        role = req.body.role
        firstName = req.body.firstName
        lastName = req.body.lastName
        gender = req.body.gender
        dob = req.body.dob
        phone = req.body.phone
        email = req.body.email
        address = req.body.address
        pinCode = req.body.pinCode
        org = req.params.org

        // Blockchain Request        
        data = await addNewUser.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, role, firstName, lastName, gender, dob, phone, email, address, pinCode)
            
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

app.post('/:org/getUserDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        org = req.params.org
       
        // Blockchain Request
        data = await getUserDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
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

app.post('/:org/updateUserDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        let newDetailsPayload
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        newDetailsPayload = req.body.newDetailsPayload
        org = req.params.org
       
        // Blockchain Request
        data = await updateUserDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone, newDetailsPayload)
            
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

app.post('/:org/addNewTest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let phone
        let description
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        phone = req.body.phone
        description = req.body.description    
        org = req.params.org

        // Blockchain Request
        data = await addNewTest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, phone, description)
            
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


app.post('/:org/updateTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let newDetailsPayload
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        newDetailsPayload = req.body.newDetailsPayload
        org = req.params.org
       
        // Blockchain Request
        data = await updateTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, newDetailsPayload)
            
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

app.post('/:org/getTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
       
        // Blockchain Request
        data = await getTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
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


app.post('/:org/getPatientTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        org = req.params.org
       
        // Blockchain Request
        data = await getPatientTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
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

app.post('/:org/requestPrice',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
        
        // Blockchain Request
        data = await requestPrice.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
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

app.post('/:org/getAllPriceRequests',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllPriceRequests.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
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

app.post('/:org/getPriceRequest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
        
        // Blockchain Request
        data = await getPriceRequest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
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

app.post('/:org/approvePriceRequest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let price
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        price = req.body.price
        org = req.params.org

        // Blockchain Request
        data = await approvePriceRequest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, price)
            
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

app.post('/:org/getAllUsersData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllUsersData.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
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

app.post('/:org/getAllTestData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllTestData.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
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

// Query Get Transaction by Transaction ID
app.post('/:org/getTransactionById', async function(req, res) {
    
    try {

        // Reference
        var result
        let data
        let txId
        let channelName
        let chainCodeName

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        smartContractName = req.body.smartContractName
        org = req.params.org
        txId = req.body.txId;
    
        // Get Data
        data = await getTransactionById.execute(org, fabricUserName, channelName, txId);
        
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
