// Dependencies
const {Contract} = require('fabric-contract-api');
const keys = require("./keys")

// Main Chaincode Class
class UserChainCode extends Contract {

	constructor() {

		// Provide a custom name to refer to this smart contract
		super('org.upstac.user');

	}

	/* ****** Contract Functions - Starts ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('User ChainCode Instantiated');
	}

	// To validate if one hospital is not updating other hospital Records
	validateUpdater(ctx, initiator){
		const initiatorID = ctx.clientIdentity.getX509Certificate();		
		if(initiatorID.issuer.organizationName.trim() !== initiator){
			throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
	}

	/**
	 * Create User
	 * @param ctx - The transaction Context object
	 * @param role - Role of the user Patient/Tester/Doctor/Govt/Insurance
	 * @param firstName - First Name of the user
	 * @param lastName - Last Name Id of the user
	 * @param gender - Gender of the user
	 * @param dob - Date of Birth of the user
	 * @param phone - Phone Number of the user
	 * @param email - Email Id of the user
	 * @param address - Address of the user
	 * @param pinCode - Pin Code of the user
	 */
	async addNewUser(ctx, role, firstName, lastName, gender, dob, phone, email, address, pinCode) {

		// Reference
		let dataBuffer
		let allUserDataBuffer
		let newRequestObject
		let dataKey = keys.userData(phone)
		let existingData
		let allUsersDataKey = keys.allUsersData()
		let allUsersData
		let allUserRequestPayload
		
		// Payload
		newRequestObject = {			
			role: role,
			firstName: firstName,
			lastName: lastName,
			gender: gender,
			dob: dob,
			phone: phone,
			email: email,
			address: address,
			pinCode: pinCode,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy : ctx.clientIdentity.getX509Certificate().issuer.organizationName.trim()
		};

		// Check if user already exists
		existingData = await ctx.stub.getState(dataKey);

		// Check if data exists
		if (!(!existingData || existingData.toString().length <= 0)) {
			throw new Error('Phone number is already reigstered');
		}

		// Get All Users
		allUsersData = await ctx.stub.getState(allUsersDataKey);
		
		// First User
		if (!allUsersData || allUsersData.toString().length <= 0) {
			allUserRequestPayload = {				
				userIds : [dataKey]
			}
		}else{ // After First User
			allUserRequestPayload = JSON.parse(allUsersData.toString())
			allUserRequestPayload.userIds.push(dataKey)
		}

		// Convert the JSON object to a buffer and send it to blockchain for storage
		dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
		allUserDataBuffer = Buffer.from(JSON.stringify(allUserRequestPayload));

		// Save in Blockchain
		await ctx.stub.putState(dataKey, dataBuffer);
		await ctx.stub.putState(allUsersDataKey, allUserDataBuffer);

		// Return Added Data
		return newRequestObject;

	}

	/**
	 * Get User Details
	 * @param ctx - The transaction Context object
	 * @param phone - User Phone Number 
	 */
	async getUserDetails(ctx, phone) {

		// Reference
		let userData
		let dataKey = keys.userData(phone)

		// Get User Data		
		userData = await ctx.stub.getState(dataKey);

		// Check if data exists
		if (!userData || userData.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		userData = JSON.parse(userData.toString());

		// Response
		return JSON.stringify(userData);

	}

	/**
	 * Update User Details
	 * @param ctx - The transaction Context object
	 * @param phone - User Phone Number 
	 * @param newDetailsPayload - New Details payload that needs to be updated. Example -> {address:abc}
	 */
	async updateUserDetails(ctx, phone, newDetailsPayload) {

		// Reference
		let userData
		let dataBuffer
		let dataKey = keys.userData(phone)

		// Get User Data		
		userData = await ctx.stub.getState(dataKey);

		// Check if data exists
		if (!userData || userData.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		userData = JSON.parse(userData.toString());

		// Parse Data into JSON
		newDetailsPayload = JSON.parse(newDetailsPayload)

		// Can not update below fields
		delete newDetailsPayload["phone"]
		delete newDetailsPayload["createdBy"]

		// Update Details
		for(let key in newDetailsPayload){
			userData[key] = newDetailsPayload[key]
		}
		userData["updatedAt"] = new Date()

		// Convert the JSON object to a buffer and send it to blockchain for storage
        dataBuffer = Buffer.from(JSON.stringify(userData));
        
        // Add in DB
		await ctx.stub.putState(dataKey, dataBuffer);

        // Response
		return JSON.stringify(userData);

	}

	/**
	 * Create Test
	 * @param ctx - The transaction Context object
	 * @param testId - Test Id
	 * @param phone - Phone Number of the Patient
	 * @param description - Test Description
	 */
	async addNewTest(ctx, testId, phone, description) {

		// Reference
		let exsitingTestData
		let dataBufferTest
		let dataBufferPatientTestMapping
		let newTestPayload
		let patientTestMappingPayload
		let patientTestMappingData
		let patientData
		let patientTestMappingKey = keys.testMapping(phone)
		let testDataKey = keys.testData(testId)
		let userDataKey = keys.userData(phone)
		let allTestDataKey = keys.allTestsData()
		let allTestData
		let allTestsRequestPayload
		let dataBufferAllTestData
		
		// Payload
		newTestPayload = {			
			testId: testId,
			phone: phone,
			description: description,			
			status: "INITIATED",
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy : ctx.clientIdentity.getX509Certificate().issuer.organizationName.trim()
		};

		// Get Patient Data		
		patientData = await ctx.stub.getState(userDataKey);

		// Check if phone Number is registered to Patient
		if (!patientData || patientData.toString().length <= 0) {
			throw new Error('No Data Found');
		}
		
		// Check for duplicate Test ID
		exsitingTestData = await ctx.stub.getState(testDataKey);
		if (!(!exsitingTestData || exsitingTestData.toString().length <= 0)) {
			throw new Error('Duplicate Test ID');
		}

		// Get All Tests
		allTestData = await ctx.stub.getState(allTestDataKey);
		
		// First User
		if (!allTestData || allTestData.toString().length <= 0) {
			allTestsRequestPayload = {				
				testIds : [testDataKey]
			}
		}else{ // After First User
			allTestsRequestPayload = JSON.parse(allTestData.toString())
			allTestsRequestPayload.testIds.push(testDataKey)
		}

		// Get Patient Previous Mapping Data
		patientTestMappingData = await ctx.stub.getState(patientTestMappingKey);
		
		// First Test
		if (!patientTestMappingData || patientTestMappingData.toString().length <= 0) {
			patientTestMappingPayload = {
				phone: patientTestMappingKey,
				testIds : [testDataKey]
			}
		}else{ // After First Test
			patientTestMappingPayload = JSON.parse(patientTestMappingData.toString())
			patientTestMappingPayload.testIds.push(testDataKey)
		}

		// Convert the JSON object to a buffer and send it to blockchain for storage
		dataBufferTest = Buffer.from(JSON.stringify(newTestPayload));
		dataBufferPatientTestMapping = Buffer.from(JSON.stringify(patientTestMappingPayload));
		dataBufferAllTestData = Buffer.from(JSON.stringify(allTestsRequestPayload));

		// Save in Blockchain
		await ctx.stub.putState(testDataKey, dataBufferTest);
		await ctx.stub.putState(patientTestMappingKey, dataBufferPatientTestMapping);
		await ctx.stub.putState(allTestDataKey, dataBufferAllTestData);

		// Return Added Data
		return newTestPayload;

	}

	/**
	 * Update Test
	 * @param ctx - The transaction Context object
	 * @param testId - Test ID
	 * @param newDetailsPayload - New Details payload that needs to be updated. Example -> {status:"COMPLETED"}
	 */
	async updateTestDetails(ctx, testId, newDetailsPayload) {

		// Reference
		let testData
		let dataBuffer
		let testDataKey = keys.testData(testId)

		// Get User Data		
		testData = await ctx.stub.getState(testDataKey);

		// Check if data exists
		if (!testData || testData.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		testData = JSON.parse(testData.toString());

		// Validate if same org is updating the record
		this.validateUpdater(ctx, testData.createdBy)

		// Can not update if status is completed
		if (testData.status == "COMPLETED") {
			throw new Error('Can not update completed test');
		}

		// Parse Data into JSON
		newDetailsPayload = JSON.parse(newDetailsPayload)

		// Can not update Bewlo fields
		delete newDetailsPayload["testId"]
		delete newDetailsPayload["createdBy"]

		// Update Details
		for(let key in newDetailsPayload){
			testData[key] = newDetailsPayload[key]
		}
		testData["updatedAt"] = new Date()

		// Convert the JSON object to a buffer and send it to blockchain for storage
        dataBuffer = Buffer.from(JSON.stringify(testData));
        
        // Add in DB
		await ctx.stub.putState(testDataKey, dataBuffer);

        // Response
		return JSON.stringify(testData);

	}

	/**
	 * Get Test Details
	 * @param ctx - The transaction Context object
	 * @param testId - Test Id
	 */
	async getTestDetails(ctx, testId) {

		// Reference
		let testData
		let testDataKey = keys.testData(testId)

		// Get User Data		
		testData = await ctx.stub.getState(testDataKey);

		// Check if data exists
		if (!testData || testData.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		testData = JSON.parse(testData.toString());

		// Response
		return JSON.stringify(testData);

	}

	/**
	 * Get Patient Test Details
	 * @param ctx - The transaction Context object
	 * @param phone - Patient Phone Number
	 */
	async getPatientTestDetails(ctx, phone) {

		// Reference
		let testData
		let response = []
		let testMappingData
		let patientTestMappingKey = keys.testMapping(phone)

		// Get User Data		
		testMappingData = await ctx.stub.getState(patientTestMappingKey);

		// Check if data exists
		if (!testMappingData || testMappingData.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Parse Data into JSON
		testMappingData = JSON.parse(testMappingData.toString());

		// Iterate Over Test
		var index
		for (index = 0; index < testMappingData.testIds.length; index++) {
			// Get Test Data
			testData = await ctx.stub.getState(testMappingData.testIds[index]);
			testData = JSON.parse(testData.toString());
			response.push(testData)			
		}

		// Response
		return JSON.stringify(response);

	}

	/**
	 * Get All Users Data
	 * @param ctx - The transaction Context object
	 */
	async getAllUsersData(ctx) {

		// Reference
		let data
		let response = []
		let key = keys.allUsersData()

		// Get All Request Data		
		data = await ctx.stub.getState(key);

		// Check if data exists
		if (!data || data.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Iterate Over Requests
		var index
		data = JSON.parse(data.toString())
		for (index = 0; index < data.userIds.length; index++) {
			let tmpData = await ctx.stub.getState(data.userIds[index]);
			tmpData = JSON.parse(tmpData.toString());
			response.push(tmpData)			
		}

		// Response
		return JSON.stringify(response);

	}

	/**
	 * Get All Test Data
	 * @param ctx - The transaction Context object
	 */
	async getAllTestData(ctx) {

		// Reference
		let data
		let response = []
		let key = keys.allTestsData()

		// Get All Request Data		
		data = await ctx.stub.getState(key);

		// Check if data exists
		if (!data || data.toString().length <= 0) {
			throw new Error('No Data Found');
		}

		// Iterate Over Requests
		var index
		data = JSON.parse(data.toString())
		for (index = 0; index < data.testIds.length; index++) {
			let tmpData = await ctx.stub.getState(data.testIds[index]);
			tmpData = JSON.parse(tmpData.toString());
			response.push(tmpData)			
		}

		// Response
		return JSON.stringify(response);

	}

	/* ****** Contract Functions - Ends ***** */

}

module.exports = UserChainCode