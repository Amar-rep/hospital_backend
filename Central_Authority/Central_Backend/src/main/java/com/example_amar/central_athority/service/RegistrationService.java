package com.example_amar.central_athority.service;

import com.example_amar.central_athority.model.Application;
import com.example_amar.central_athority.model.Device;
import com.example_amar.central_athority.model.Installer;
import com.example_amar.central_athority.repository.ApplicationRepository;
import com.example_amar.central_athority.repository.DeviceRepository;
import com.example_amar.central_athority.repository.InstallerRepository;
import com.example_amar.central_athority.request.RegisterRequest;
import com.example_amar.central_athority.response.RegisterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final ApplicationRepository applicationRepository;
    private final InstallerRepository installerRepository;
    private final DeviceRepository deviceRepository;
    private final SecretKeyService keyService;

    public RegisterResponse register(RegisterRequest registerRequest) throws Exception{

        try{
             Application app=applicationRepository.findById(registerRequest.getAppId()).orElseThrow(()->
             {
                 return new IllegalArgumentException("Invalid app id:"+registerRequest.getAppId());
             });
            Optional<Device> existingDevice = deviceRepository.findByDeviceId(
                    registerRequest.getDeviceId()
            );

            if (existingDevice.isPresent()) {
                throw new SecurityException("Device is already registered.");
            }


               boolean isValid=keyService.verifyHmac(registerRequest.getInstallerId(),registerRequest.getAppId(),registerRequest.getDeviceId(),registerRequest.getInstallerSignature());

             if(!isValid)
             {
                 throw new SecurityException("Invalid installer signature");
             }
             // will fix later
            // TODO : fix creating new objects
             UUID newRegistrationId=UUID.randomUUID();
             String newAppSecret=generateSecureRandomString();
            Device device = new Device();
            Installer installer=installerRepository.findByInstallerUuid(UUID.fromString(registerRequest.getInstallerId())).orElseThrow(()->{
                return  new IllegalArgumentException("Invalid installer id:"+registerRequest.getInstallerId());
            });
            device.setRegistrationId(newRegistrationId);
            device.setDeviceId(registerRequest.getDeviceId());
            device.setApp(app);
            device.setInstaller(installer);
            device.setAppSecret(newAppSecret);
            device.setStatus("ACTIVE");
            device.setCreatedAt(OffsetDateTime.now());

            Device savedDevice = deviceRepository.save(device);

            return new RegisterResponse(
                    savedDevice.getRegistrationId().toString(),
                    "1.0",
                    savedDevice.getAppSecret()
            );

        } catch (Exception e) {
            throw e;
        }
    }

    private String generateSecureRandomString()
    {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32]; // 256 bits
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }


}
