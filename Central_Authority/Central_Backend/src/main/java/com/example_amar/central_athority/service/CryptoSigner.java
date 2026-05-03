package com.example_amar.central_athority.service;

import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;

public class CryptoSigner {

    /**
     * Signs a message/transaction hash with the Private Key.
     * Returns the signature as a combined Hex String.
     */
    public String signTransaction(String privateKeyHex, String transactionData) {
        // 1. Convert Private Key from Hex String to BigInteger
        BigInteger privateKey = new BigInteger(privateKeyHex, 16);

        // 2. Create the KeyPair object
        ECKeyPair keyPair = ECKeyPair.create(privateKey);

        // 3. Hash the data (Simulating a transaction hash)
        // In real blockchains, you hash the transaction bytes (Keccak-256)
        byte[] msgHash = Hash.sha3(transactionData.getBytes());

        // 4. Sign the Hash
        // 'false' means we don't need to hash inside the function, we already did it above
        Sign.SignatureData signature = Sign.signMessage(msgHash, keyPair, false);

        // 5. Convert components (r, s, v) to a single Hex string for transport
        // Format: [R (32 bytes)] [S (32 bytes)] [V (1 byte)]
        byte[] r = signature.getR();
        byte[] s = signature.getS();
        byte[] v = signature.getV();

        // Combine arrays
        byte[] combined = new byte[r.length + s.length + v.length];
        System.arraycopy(r, 0, combined, 0, r.length);
        System.arraycopy(s, 0, combined, r.length, s.length);
        System.arraycopy(v, 0, combined, r.length + s.length, v.length);

        return Numeric.toHexString(combined);
    }

    /**
     * Verifies a signature.
     * Returns TRUE if the signature matches the provided Public Key.
     */
    public boolean verifyTransaction(String publicKeyHex, String transactionData, String signatureHex) {
        // 1. Hash the original data (Must match the hash used during signing)
        byte[] msgHash = Hash.sha3(transactionData.getBytes());

        // 2. Parse the Hex Signature back into components (r, s, v)
        byte[] signatureBytes = Numeric.hexStringToByteArray(signatureHex);

        // r = first 32 bytes, s = next 32 bytes, v = last 1 byte
        byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
        byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);
        byte[] v = Arrays.copyOfRange(signatureBytes, 64, 65);

        Sign.SignatureData signatureData = new Sign.SignatureData(v[0], r, s);

        try {
            // 3. Recover the Public Key from the Signature and Message
            BigInteger recoveredKey = Sign.signedMessageToKey(msgHash, signatureData);

            // 4. Clean up the Input Public Key (Remove '04' prefix if present)
            String cleanInputPubKey = publicKeyHex.startsWith("04")
                    ? publicKeyHex.substring(2)
                    : publicKeyHex;

            BigInteger expectedKey = new BigInteger(cleanInputPubKey, 16);

            // 5. Compare
            return recoveredKey.equals(expectedKey);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // --- Example Usage ---
    /*public static void main(String[] args) throws Exception {
        CryptoSigner crypto = new CryptoSigner();

        // 1. Mock Keys (Use the ones from your previous method)
        String privKey = "1e85a666324b910411eb33604f09d84c62c95454687d58129202580b08051675";
        // Note: The code handles pubKey with or without "04"
        String pubKey  = "04c107f97805d7629589d88591e149c9339794025d43a758715783515065a324866b1a2082b260027725925e0161476686a9f46b1c09893d5679c55b6a382d5a3f";

        String myTransactionData = "Transfer 10 Coins to Bob";

        System.out.println("Data: " + myTransactionData);

        // 2. Sign
        String signature = crypto.signTransaction(privKey, myTransactionData);
        System.out.println("Signature: " + signature);

        // 3. Verify
        boolean isValid = crypto.verifyTransaction(pubKey, myTransactionData, signature);
        System.out.println("Signature Valid? " + isValid);

        // 4. Verify Tampering Test
        boolean isTamperedValid = crypto.verifyTransaction(pubKey, "Transfer 1000 Coins", signature);
        System.out.println("Tampered Data Valid? " + isTamperedValid);
    }*/
}