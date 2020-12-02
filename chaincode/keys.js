
function userData(phone){
    return "USER_" + phone
}

function testData(testId){
    return "TEST_" + testId
}

function testMapping(phone){
    return "TESTMAPPING_" + phone
}

function allUsersData(){
    return "ALLUSERSDATA"
}

function allTestsData(){
    return "ALLTESTSDATA"
}

function priceRequest(testId){
    return "PRICEREQUEST_" + testId
}

function allPriceRequest(){
    return "ALLPRICEREQUEST"
}


module.exports = {
    userData,
    allUsersData,
    testData,
    testMapping,
    allPriceRequest,
    priceRequest,
    allTestsData
}