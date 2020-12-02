const express = require('express');
const app = express();
const cors = require('cors');
const port = 4003;

// Import all function modules
const getUserDetails = require('./getUserDetails');
const addToWallet = require('./addToWallet');
const getTestDetails = require("./getTestDetails")
const getPatientTestDetails = require("./getPatientTestDetails")
const requestPrice = require("./requestPrice")
const getAllPriceRequests = require("./getAllPriceRequests")
const getPriceRequest = require("./getPriceRequest")
const approvePriceRequest = require("./approvePriceRequest")

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Upstac App');

app.get('/', (req, res) => res.send('Hello insurance'));

app.post('/insurance/addToWallet', (req, res) => {
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
app.post('/insurance/getUserDetails',async (req, res) => {

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
app.post('/insurance/getTestDetails',async (req, res) => {

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


app.post('/insurance/getPatientTestDetails',async (req, res) => {

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

app.post('/insurance/requestPrice',async (req, res) => {

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

app.post('/insurance/getAllPriceRequests',async (req, res) => {

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

app.post('/insurance/getPriceRequest',async (req, res) => {

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

app.post('/insurance/approvePriceRequest',async (req, res) => {

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

app.listen(port, () => console.log(`Distributed App listening on port ${port}!`));
