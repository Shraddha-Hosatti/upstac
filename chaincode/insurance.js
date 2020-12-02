// Dependencies
const {Contract} = require('fabric-contract-api');
const keys = require("./keys")


// Main Chaincode Class
class InsuranceChainCode extends Contract {

	constructor() {

		// Provide a custom name to refer to this smart contract
		super('org.upstac.insurance');

	}

	/* ****** Contract Functions - Starts ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('User ChainCode Instantiated');
	}

	// To validate if only hospital is approving request and insurance is creating request
	validateOrg(ctx, initiator){
		const initiatorID = ctx.clientIdentity.getX509Certificate();		
		if(initiatorID.issuer.organizationName.trim() !== initiator){
			throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
	}

	/**
	 * Request Price for test
	 * @param ctx - The transaction Context object
	 * @param testId - Test Id
	 */
	async requestPrice(ctx, testId) {

		// Reference
		let dataBuffer
		let testData
		let priceRequestKey = keys.priceRequest(testId)
		let requestPricePayload
		let allRequestKey = keys.allPriceRequest()
		let allRequestData
		let allRequestDataPayload
		let allRequestDataBuffer
		let existingData

		// Validate Request
		this.validateOrg(ctx, 'insurance.upstac.com')

		// Get Test Data from common channel -> will raise error if test id not found
		testData = await ctx.stub.invokeChaincode("common", ["org.upstac.user:getTestDetails", testId], "common");
		
		// Get All Requests
		allRequestData = await ctx.stub.getState(allRequestKey);

		// Check if user already exists
		existingData = await ctx.stub.getState(priceRequestKey);

		// Check if data exists
		if (!(!existingData || existingData.toString().length <= 0)) {
			throw new Error('Request is already generated for this test ID');
		}
		
		// First Request
		if (!allRequestData || allRequestData.toString().length <= 0) {
			allRequestDataPayload = {				
				requestIds : [priceRequestKey]
			}
		}else{ // After First Request
			allRequestDataPayload = JSON.parse(allRequestData.toString())
			allRequestDataPayload.requestIds.push(priceRequestKey)
		}

        // Payload
        requestPricePayload = {			
            testId : testId,
			status : 'PENDING',
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy : ctx.clientIdentity.getX509Certificate().issuer.organizationName.trim()
		};

		// Convert the JSON object to a buffer and send it to blockchain for storage
        dataBuffer = Buffer.from(JSON.stringify(requestPricePayload));
		allRequestDataBuffer = Buffer.from(JSON.stringify(allRequestDataPayload));
		
        // Add in DB
		await ctx.stub.putState(priceRequestKey, dataBuffer);
		await ctx.stub.putState(allRequestKey, allRequestDataBuffer);

		// Return value of new student account created to user
		return requestPricePayload;

	}

	/**
	 * Get All Price Requests
	 * @param ctx - The transaction Context object
	 */
	async getAllPriceRequests(ctx) {

		// Reference
		let data
		let response = []
		let allRequestKey = keys.allPriceRequest()

		// Get All Request Data		
		data = await ctx.stub.getState(allRequestKey);

		// Check if data exists
		if (!data || data.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Iterate Over Requests
		var index
		data = JSON.parse(data.toString())
		for (index = 0; index < data.requestIds.length; index++) {
			let tmpData = await ctx.stub.getState(data.requestIds[index]);
			tmpData = JSON.parse(tmpData.toString());
			response.push(tmpData)			
		}

		// Response
		return JSON.stringify(response);

	}
	
	/**
	 * Request Price for test
	 * @param ctx - The transaction Context object
	 * @param testId - Test Id
	 */
	async getPriceRequest(ctx, testId) {

		// Reference
		let data
		let priceRequestId = keys.priceRequest(testId)

		// Get User Data		
		data = await ctx.stub.getState(priceRequestId);

		// Check if data exists
		if (!data || data.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		data = JSON.parse(data.toString());

		// Response
		return JSON.stringify(data);

	}
	
	/**
	 * Approve Price Request
	 * @param ctx - The transaction Context object
	 * @param testId - Test Id
	 * @param price - Test price
	 */
    async approvePriceRequest(ctx, testId, price) {

		// Reference
		let dataBuffer
		let requestData
		let priceRequestKey = keys.priceRequest(testId)

		// Validate Request
		this.validateOrg(ctx, 'hospitalA.upstac.com')

        // Get Request Data
		requestData = await ctx.stub.getState(priceRequestKey);
		if (!requestData || requestData.toString().length <= 0) {
			throw new Error('No Data Found');
        }

        // Parse Data
        requestData = JSON.parse(requestData.toString());
		
        // Check if already approved
        if (requestData.status == "APPROVED") {
			throw new Error('Already Approved');
		}

        // Update Status
        requestData.status = "APPROVED"
		requestData.price = price
		requestData.updatedAt = new Date()
		requestData.approvedBy = ctx.clientIdentity.getX509Certificate().issuer.organizationName.trim()

        // Convert the JSON object to a buffer and send it to blockchain for storage
        dataBuffer = Buffer.from(JSON.stringify(requestData));
        
        // Add in DB
		await ctx.stub.putState(priceRequestKey, dataBuffer);

        // Reposnse
		return requestData
    }

	/* ****** Contract Functions - Ends ***** */

}

module.exports = InsuranceChainCode