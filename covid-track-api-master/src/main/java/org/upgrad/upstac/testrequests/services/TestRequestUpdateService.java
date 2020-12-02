package org.upgrad.upstac.testrequests.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.upgrad.upstac.exception.AppException;
import org.upgrad.upstac.testrequests.TestRequest;
import org.upgrad.upstac.testrequests.TestRequestRepository;
import org.upgrad.upstac.testrequests.consultation.Consultation;
import org.upgrad.upstac.testrequests.consultation.ConsultationService;
import org.upgrad.upstac.testrequests.consultation.models.CreateConsultationRequest;
import org.upgrad.upstac.testrequests.flow.TestRequestFlowService;
import org.upgrad.upstac.testrequests.lab.LabResult;
import org.upgrad.upstac.testrequests.lab.LabResultService;
import org.upgrad.upstac.testrequests.lab.models.CreateLabResult;
import org.upgrad.upstac.testrequests.models.RequestStatus;
import org.upgrad.upstac.users.User;

import javax.transaction.Transactional;
import javax.validation.Valid;

// Blockchain
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import static org.upgrad.upstac.shared.Blockchain.blockchainRequest;
import org.springframework.core.env.Environment;


@Service
@Slf4j
@Validated
public class TestRequestUpdateService {

    @Autowired
    private TestRequestRepository testRequestRepository;


    @Autowired
    private TestRequestFlowService testRequestFlowService;


    @Autowired
    private LabResultService labResultService;


    @Autowired
    private ConsultationService consultationService;

    @Autowired
    private Environment env;


    @Transactional
    public TestRequest saveTestRequest(@Valid TestRequest result) {


        return testRequestRepository.save(result);
    }


    TestRequest updateStatusAndSave(TestRequest testRequest, RequestStatus status) {
        testRequest.setStatus(status);

        // Blockchain Base Parameters
        String baseURL = env.getProperty("blockchain.baseURL");
        String fabricUserName = env.getProperty("blockchain.fabricUserName");
        String useBlockchain =  env.getProperty("blockchain.use");
        String url = baseURL + "updateTestDetails";

        // Blockchain Request Body Parameters
        String newDetailsPayload = "";
        newDetailsPayload = newDetailsPayload + "{\"status\" :  \""+status.name()+"\"} ";
        HashMap values = new HashMap<String, String>();
        values.put("fabricUserName", fabricUserName);
        values.put("channelName", "common");
        values.put("chainCodeName", "common");
        values.put("smartContractName", "org.upstac.user");
        values.put("testId", String.valueOf(testRequest.getRequestId()));
        values.put("newDetailsPayload", newDetailsPayload);

        // Blockchain Request
        blockchainRequest(useBlockchain, url, values);


        return saveTestRequest(testRequest);
    }


    public TestRequest assignForLabTest(Long id, User tester) {
        TestRequest testRequest = testRequestRepository.findByRequestIdAndStatus(id,RequestStatus.INITIATED).orElseThrow(()-> new AppException("Invalid ID"));
        LabResult labResult= labResultService.assignForLabTest(testRequest,tester);
        testRequestFlowService.log(testRequest, RequestStatus.INITIATED, RequestStatus.LAB_TEST_IN_PROGRESS, tester);
        testRequest.setLabResult(labResult);
        return updateStatusAndSave(testRequest, RequestStatus.LAB_TEST_IN_PROGRESS);
    }

    public TestRequest updateLabTest(Long id,@Valid CreateLabResult createLabResult, User tester) {

        TestRequest testRequest = testRequestRepository.findByRequestIdAndStatus(id,RequestStatus.LAB_TEST_IN_PROGRESS).orElseThrow(()-> new AppException("Invalid ID or State"));


        labResultService.updateLabTest(testRequest,createLabResult);
        testRequestFlowService.log(testRequest, RequestStatus.LAB_TEST_IN_PROGRESS, RequestStatus.LAB_TEST_COMPLETED, tester);
        return updateStatusAndSave(testRequest, RequestStatus.LAB_TEST_COMPLETED);
    }

    public TestRequest assignForConsultation(Long id, User doctor) {
        TestRequest testRequest = testRequestRepository.findByRequestIdAndStatus(id,RequestStatus.LAB_TEST_COMPLETED).orElseThrow(()-> new AppException("Invalid ID or State"));
        Consultation consultation =consultationService.assignForConsultation(testRequest,doctor);
        testRequestFlowService.log(testRequest, RequestStatus.LAB_TEST_COMPLETED, RequestStatus.DIAGNOSIS_IN_PROCESS, doctor);
        testRequest.setConsultation(consultation);
        return updateStatusAndSave(testRequest, RequestStatus.DIAGNOSIS_IN_PROCESS);
    }


    public TestRequest updateConsultation(Long id, @Valid CreateConsultationRequest createConsultationRequest, User doctor) {

        TestRequest testRequest = testRequestRepository.findByRequestIdAndStatus(id,RequestStatus.DIAGNOSIS_IN_PROCESS).orElseThrow(()-> new AppException("Invalid ID or State"));
        consultationService.updateConsultation(testRequest,createConsultationRequest);
        testRequestFlowService.log(testRequest, RequestStatus.DIAGNOSIS_IN_PROCESS, RequestStatus.COMPLETED, doctor);

        // Blockchain Base Parameters
        String baseURL = env.getProperty("blockchain.baseURL");
        String fabricUserName = env.getProperty("blockchain.fabricUserName");
        String useBlockchain =  env.getProperty("blockchain.use");
        String url = baseURL + "updateTestDetails";

        // Blockchain Request Body Parameters
        String newDetailsPayload = "";
        newDetailsPayload = newDetailsPayload + "{\"doctorSuggestion\" :  \""+createConsultationRequest.getSuggestion()+"\", ";
        newDetailsPayload = newDetailsPayload + "\"doctorComment\" :  \""+createConsultationRequest.getComments()+"\" }";
        HashMap values = new HashMap<String, String>();
        values.put("fabricUserName", fabricUserName);
        values.put("channelName", "common");
        values.put("chainCodeName", "common");
        values.put("smartContractName", "org.upstac.user");
        values.put("testId", String.valueOf(testRequest.getRequestId()));
        values.put("newDetailsPayload", newDetailsPayload);

        // Blockchain Request
        blockchainRequest(useBlockchain, url, values);

        return updateStatusAndSave(testRequest, RequestStatus.COMPLETED);
    }


}
