package org.upgrad.upstac.testrequests.lab;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.upgrad.upstac.exception.AppException;
import org.upgrad.upstac.testrequests.TestRequest;
import org.upgrad.upstac.testrequests.lab.models.CreateLabResult;
import org.upgrad.upstac.users.User;

import javax.transaction.Transactional;
import java.time.LocalDate;

// Blockchain
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import static org.upgrad.upstac.shared.Blockchain.blockchainRequest;
import static org.upgrad.upstac.shared.DateParser.getDateFromString;

import org.springframework.core.env.Environment;

@Service
@Validated
public class LabResultService {


    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private Environment env;


    private static Logger logger = LoggerFactory.getLogger(LabResultService.class);



    private LabResult createLabResult(User tester, TestRequest testRequest) {
        LabResult labResult = new LabResult();
        labResult.setTester(tester);
        labResult.setRequest(testRequest);
        return saveLabResult(labResult);
    }

    @Transactional
     LabResult saveLabResult(LabResult labResult) {
        return labResultRepository.save(labResult);
    }



    public LabResult assignForLabTest(TestRequest testRequest, User tester) {

       return createLabResult(tester, testRequest);


    }


    public LabResult updateLabTest(TestRequest testRequest, CreateLabResult createLabResult) {

         LabResult labResult = labResultRepository.findByRequest(testRequest).orElseThrow(()-> new AppException("Invalid Request"));

        labResult.setBloodPressure(createLabResult.getBloodPressure());
        labResult.setComments(createLabResult.getComments());
        labResult.setHeartBeat(createLabResult.getHeartBeat());
        labResult.setOxygenLevel(createLabResult.getOxygenLevel());
        labResult.setTemperature(createLabResult.getTemperature());
        labResult.setResult(createLabResult.getResult());
        labResult.setUpdatedOn(LocalDate.now());

        // Blockchain Base Parameters
        String baseURL = env.getProperty("blockchain.baseURL");
        String fabricUserName = env.getProperty("blockchain.fabricUserName");
        String useBlockchain =  env.getProperty("blockchain.use");
        String url = baseURL + "updateTestDetails";

        // Blockchain Request Body Parameters
        String newDetailsPayload = "";
        newDetailsPayload = newDetailsPayload + "{\"bloodPressure\" :  \""+createLabResult.getBloodPressure()+"\",";
        newDetailsPayload = newDetailsPayload + "\"comment\" :  \""+createLabResult.getComments()+"\",";
        newDetailsPayload = newDetailsPayload + "\"heartbeat\" :  \""+createLabResult.getHeartBeat()+"\", ";
        newDetailsPayload = newDetailsPayload + "\"o2Level\" :  \""+createLabResult.getOxygenLevel()+"\", ";
        newDetailsPayload = newDetailsPayload + "\"temprature\" :  \""+createLabResult.getTemperature()+"\", ";
        newDetailsPayload = newDetailsPayload + "\"result\" :  \""+createLabResult.getResult()+"\" }";
        HashMap values = new HashMap<String, String>();
        values.put("fabricUserName", fabricUserName);
        values.put("channelName", "common");
        values.put("chainCodeName", "common");
        values.put("smartContractName", "org.upstac.user");
        values.put("testId", String.valueOf(testRequest.getRequestId()));
        values.put("newDetailsPayload", newDetailsPayload);

        // Blockchain Request
        blockchainRequest(useBlockchain, url, values);

        return saveLabResult(labResult);

    }


}
