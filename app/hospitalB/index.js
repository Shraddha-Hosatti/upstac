const express = require('express');
const app = express();
const cors = require('cors');
const port = 4001;

// Import all function modules
const addNewUser = require('./addNewUser');
const getUserDetails = require('./getUserDetails');
const addToWallet = require('./addToWallet');
const updateUserDetails = require('./updateUserDetails');
const addNewTest = require('./addNewTest');
const updateTestDetails = require("./updateTestDetails")
const getTestDetails = require("./getTestDetails")
const getPatientTestDetails = require("./getPatientTestDetails")
const requestPrice = require("./requestPrice")
const getAllPriceRequests = require("./getAllPriceRequests")
const getPriceRequest = require("./getPriceRequest")
const approvePriceRequest = require("./approvePriceRequest")
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

app.get('/', (req, res) => res.send('Hello hospitalB'));

app.post('/hospitalB/addToWallet', (req, res) => {
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


app.post('/hospitalB/registerUser', (req, res) => {
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

app.post('/hospitalB/registerAdmin', (req, res) => {
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

app.post('/hospitalB/revokeUser', (req, res) => {
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

app.post('/hospitalB/addNewUser',async (req, res) => {

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

        // Blockchain Request
        data = await addNewUser.execute(fabricUserName, channelName, chainCodeName, smartContractName, role, firstName, lastName, gender, dob, phone, email, address, pinCode)
            
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

app.post('/hospitalB/getUserDetails',async (req, res) => {

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

app.post('/hospitalB/updateUserDetails',async (req, res) => {

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
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        newDetailsPayload = req.body.newDetailsPayload
       
        // Blockchain Request
        data = await updateUserDetails.execute(fabricUserName, channelName, chainCodeName, smartContractName, phone, newDetailsPayload)
            
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

app.post('/hospitalB/addNewTest',async (req, res) => {

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
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        phone = req.body.phone
        description = req.body.description        

        // Blockchain Request
        data = await addNewTest.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId, phone, description)
            
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


app.post('/hospitalB/updateTestDetails',async (req, res) => {

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
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        newDetailsPayload = req.body.newDetailsPayload
       
        // Blockchain Request
        data = await updateTestDetails.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId, newDetailsPayload)
            
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

app.post('/hospitalB/getTestDetails',async (req, res) => {

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


app.post('/hospitalB/getPatientTestDetails',async (req, res) => {

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

app.post('/hospitalB/requestPrice',async (req, res) => {

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
        data = await requestPrice.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
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

app.post('/hospitalB/getAllPriceRequests',async (req, res) => {

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
        data = await getAllPriceRequests.execute(fabricUserName, channelName, chainCodeName, smartContractName)
            
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

app.post('/hospitalB/getPriceRequest',async (req, res) => {

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
        data = await getPriceRequest.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
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

app.post('/hospitalB/approvePriceRequest',async (req, res) => {

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
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        price = req.body.price

        // Blockchain Request
        data = await approvePriceRequest.execute(fabricUserName, channelName, chainCodeName, smartContractName, testId, price)
            
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

app.post('/hospitalB/getAllUsersData',async (req, res) => {

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

app.post('/hospitalB/getAllTestData',async (req, res) => {

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
