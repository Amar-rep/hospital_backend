package com.example_amar.central_athority.service;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.utils.Numeric;

@Service
public class KeyGenerationService {

    private final SecureRandom secureRandom = new SecureRandom();

    public Map<String, String> generateSecp256k1HexKeyPair() throws Exception {
        // Generate random EC key pair
        ECKeyPair keyPair = Keys.createEcKeyPair(secureRandom);

        BigInteger privateKey = keyPair.getPrivateKey();
        BigInteger publicKey = keyPair.getPublicKey();

        // Pad hex to 64 chars for private key
        String privHex = Numeric.toHexStringWithPrefixZeroPadded(privateKey, 64);

        // Pad hex to 128 chars for public key AND add "04" prefix
        // This results in the standard 130-character uncompressed public key
        String pubHex = Numeric.toHexStringWithPrefixZeroPadded(publicKey, 128);

        Map<String, String> keys = new HashMap<>();
        keys.put("privateKey", privHex);
        keys.put("publicKey", pubHex);

        return keys;
    }

}
