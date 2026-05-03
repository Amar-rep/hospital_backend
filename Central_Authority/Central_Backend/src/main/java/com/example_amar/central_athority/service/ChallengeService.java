package com.example_amar.central_athority.service;

import com.example_amar.central_athority.exceptions.ResourceNotFoundException;
import com.example_amar.central_athority.model.AuthChallenge;
import com.example_amar.central_athority.model.Device;
import com.example_amar.central_athority.repository.ApplicationRepository;
import com.example_amar.central_athority.repository.AuthChallengeRepository;
import com.example_amar.central_athority.repository.DeviceRepository;
import com.example_amar.central_athority.request.ChallengeRequest;
import com.example_amar.central_athority.response.ChallengeResponse;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChallengeService {
    private final ApplicationRepository applicationRepository;
    private final DeviceRepository deviceRepository;
    private final AuthChallengeRepository challengeRepository;
    private static final int   CHALLENGE_VALIDITY_SECONDS=30;
    public ChallengeResponse generateChallenge(ChallengeRequest request) throws Exception
    {
        // check  if appid valid, deviceid valid , and registration id valid
       isValidChallengeRequest(request);
       // check if all  components exist
        Device device= isValidDevice(request);

        ChallengeResponse response= generateChallengeResponse(request);
        saveChallenge(response,device);
        return response;

    }
    private void  isValidChallengeRequest(ChallengeRequest request) throws Exception {
       if(request.getAppId()==null||request.getRegistrationId()==null ||request.getDeviceId()==null)
       {
            throw new BadRequestException("Invalid request");
       }
        if(StringUtils.isBlank(request.getAppId())||StringUtils.isBlank(request.getRegistrationId())||StringUtils.isBlank(request.getDeviceId()))
        {
            throw new BadRequestException("Invalid request");
        }

    }

    private Device isValidDevice(ChallengeRequest request) throws Exception
    {
        Device device = deviceRepository.findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found "));
        if(device.getStatus().equalsIgnoreCase("INACTIVE"))
        {
            throw new SecurityException("Device is inactive");
        }
        if(!device.getApp().getAppId().equalsIgnoreCase(request.getAppId()))
        {
            throw new SecurityException("Invalid app id");
        }
        if(!device.getRegistrationId().toString().equalsIgnoreCase(request.getRegistrationId()))
        {
            throw new SecurityException("Invalid registration id");
        }
        return device;
    }


    private ChallengeResponse generateChallengeResponse(ChallengeRequest request)
    {
            String challengeId= "CHAL-"+ UUID.randomUUID().toString();
            String serverRandom= UUID.randomUUID().toString();

            ChallengeResponse response= ChallengeResponse.builder().challengeId(challengeId).serverRandom(serverRandom).timeStamp(Instant.now().
                    getEpochSecond()).validForSeconds(CHALLENGE_VALIDITY_SECONDS).build();
            return response;
    }

    private void saveChallenge(ChallengeResponse challengeResponse,Device device)
    {
        AuthChallenge challenge=new AuthChallenge();
        challenge.setChallengeId(challengeResponse.getChallengeId());
        challenge.setServerRandom(challengeResponse.getServerRandom());
        challenge.setRegistration(device);
        challenge.setIssuedEpoch(challengeResponse.getTimeStamp());
        challenge.setExpiresEpoch(challengeResponse.getTimeStamp()+challengeResponse.getValidForSeconds());
        challengeRepository.save(challenge);
    }

}
