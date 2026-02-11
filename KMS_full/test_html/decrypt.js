/**
 * ECIES Decryption for Java BouncyCastle compatibility
 * 
 * This script decrypts keys encrypted using Java KeyService.encryptKeyWithPublicKey()
 * which uses BouncyCastle's "ECIES" algorithm with secp256k1.
 * 
 * BouncyCastle default ECIES (without explicit algorithm):
 * - Uses IES with default parameters
 * - KDF2 with SHA-1
 * - AES-128-CBC for symmetric encryption
 * - HMAC-SHA-1 for MAC
 * 
 * Format: [65: Ephemeral PubKey] + [IV/Params] + [Ciphertext] + [20: MAC]
 */

const crypto = require('crypto');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

/**
 * KDF2 Key Derivation Function with SHA-1 (BouncyCastle default)
 * Derives key material from shared secret
 */
function kdf2(sharedSecret, outputLen) {
    const output = Buffer.alloc(outputLen);
    let counter = 1;
    let offset = 0;

    while (offset < outputLen) {
        // KDF2 format: Hash(Z || counter)
        const counterBuf = Buffer.alloc(4);
        counterBuf.writeUInt32BE(counter);

        const hash = crypto.createHash('sha1');
        hash.update(sharedSecret);
        hash.update(counterBuf);
        const digest = hash.digest();

        const bytesToCopy = Math.min(digest.length, outputLen - offset);
        digest.copy(output, offset, 0, bytesToCopy);
        offset += bytesToCopy;
        counter++;
    }

    return output;
}

/**
 * Decrypts ECIES encrypted data from Java BouncyCastle
 * 
 * BC's default IESEngine output format:
 * [65 bytes: EphemeralPublicKey] + [encrypted data] + [20 bytes: MAC]
 * 
 * Where encrypted data is AES-128-CBC(derivedKey, plaintext)
 * derivedKey and macKey are derived via KDF2(ECDH_SharedSecret)
 * 
 * @param {string} base64Data - Base64 encoded encrypted key from Java
 * @param {string} privateKeyHex - Private key in hex (with or without 0x prefix)
 * @returns {Buffer} - Decrypted key bytes
 */
function decryptECIESFromJava(base64Data, privateKeyHex) {
    const fullBuffer = Buffer.from(base64Data, 'base64');

    console.log("Total encrypted length:", fullBuffer.length, "bytes");

    // Parse: [65: EphemeralPubKey] + [ciphertext with possible IV] + [20: MAC]
    const ephemeralPubKey = fullBuffer.slice(0, 65);
    const macReceived = fullBuffer.slice(fullBuffer.length - 20);
    const encryptedPayload = fullBuffer.slice(65, fullBuffer.length - 20);

    console.log("Ephemeral PubKey (first byte):", ephemeralPubKey[0].toString(16));
    console.log("Encrypted payload length:", encryptedPayload.length, "bytes");
    console.log("MAC length:", macReceived.length, "bytes");

    // ECDH to derive shared secret
    const privKey = ec.keyFromPrivate(privateKeyHex.replace('0x', ''), 'hex');
    const pubKey = ec.keyFromPublic(ephemeralPubKey);
    const sharedSecret = privKey.derive(pubKey.getPublic());
    const sharedSecretBuffer = Buffer.from(sharedSecret.toArray('be', 32));

    console.log("Shared secret (first 8 bytes):", sharedSecretBuffer.slice(0, 8).toString('hex'));

    // Try different decryption approaches since BC ECIES can vary

    // Approach 1: XOR-based (simplest IES)
    console.log("\n--- Trying XOR-based decryption ---");
    try {
        const result = tryXorDecryption(encryptedPayload, macReceived, sharedSecretBuffer);
        console.log("✅ XOR decryption succeeded!");
        return result;
    } catch (e) {
        console.log("XOR approach failed:", e.message);
    }

    // Approach 2: AES-128-CBC with IV prepended
    console.log("\n--- Trying AES-128-CBC with prepended IV ---");
    try {
        const result = tryAesCbcWithIv(encryptedPayload, macReceived, sharedSecretBuffer);
        console.log("✅ AES-CBC with IV decryption succeeded!");
        return result;
    } catch (e) {
        console.log("AES-CBC with IV approach failed:", e.message);
    }

    // Approach 3: AES-128-CBC with zero IV
    console.log("\n--- Trying AES-128-CBC with zero IV ---");
    try {
        const result = tryAesCbcZeroIv(encryptedPayload, macReceived, sharedSecretBuffer);
        console.log("✅ AES-CBC with zero IV decryption succeeded!");
        return result;
    } catch (e) {
        console.log("AES-CBC zero IV approach failed:", e.message);
    }

    throw new Error("All decryption approaches failed. The encryption format may not match expected BouncyCastle ECIES.");
}

function tryXorDecryption(ciphertext, macReceived, sharedSecret) {
    // Derive keys: enough for XOR + MAC
    const keyLen = ciphertext.length + 20;
    const derivedKey = kdf2(sharedSecret, keyLen);
    const encKey = derivedKey.slice(0, ciphertext.length);
    const macKey = derivedKey.slice(ciphertext.length);

    // Verify MAC
    const calculatedMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calculatedMac.equals(macReceived)) {
        throw new Error("MAC verification failed");
    }

    // XOR decrypt
    const plaintext = Buffer.alloc(ciphertext.length);
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = ciphertext[i] ^ encKey[i];
    }

    return plaintext;
}

function tryAesCbcWithIv(payload, macReceived, sharedSecret) {
    // Format: [16: IV] + [Ciphertext]
    if (payload.length < 16) {
        throw new Error("Payload too short for IV");
    }

    const iv = payload.slice(0, 16);
    const ciphertext = payload.slice(16);

    // Derive: 16 bytes AES key + 20 bytes MAC key
    const derivedKey = kdf2(sharedSecret, 36);
    const aesKey = derivedKey.slice(0, 16);
    const macKey = derivedKey.slice(16, 36);

    // Verify MAC over ciphertext (not including IV)
    const calculatedMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calculatedMac.equals(macReceived)) {
        // Try MAC over entire payload
        const calculatedMac2 = crypto.createHmac('sha1', macKey).update(payload).digest();
        if (!calculatedMac2.equals(macReceived)) {
            throw new Error("MAC verification failed");
        }
    }

    // AES-128-CBC decrypt
    const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return plaintext;
}

function tryAesCbcZeroIv(ciphertext, macReceived, sharedSecret) {
    // Derive: 16 bytes AES key + 20 bytes MAC key
    const derivedKey = kdf2(sharedSecret, 36);
    const aesKey = derivedKey.slice(0, 16);
    const macKey = derivedKey.slice(16, 36);

    // Verify MAC
    const calculatedMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calculatedMac.equals(macReceived)) {
        throw new Error("MAC verification failed");
    }

    // AES-128-CBC decrypt with zero IV
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return plaintext;
}

/**
 * Convenience function to get decrypted key as Base64 string
 */
function decryptKeyAsBase64(base64EncryptedKey, privateKeyHex) {
    const decryptedBytes = decryptECIESFromJava(base64EncryptedKey, privateKeyHex);
    return decryptedBytes.toString('base64');
}

// ========== TEST ==========
const privateKey = "0xbc1d4431962fa069c84eb472a84b1c43f0f68617a7d2022201bbb95c5a954c09";
const encryptedKeyBase64 = "BBEnzaBzD9ZwhdEeFaP77LBxme77stNzbgMp8GawKjEvEKgcJLNBahDe+gZgUroqPXWyoRZik7izCNl7P8VxDSmhtTNrZ/NCKll00qcyzRwMhtJgsvxP8mIwgabKrSfr/fp+HKWqoFc6p7Hw10ocKqaCMceJDthEvWgMB2MsdV03+yS/A+m7ARzB+D3nD2um8pKgKTo=";

console.log("=== ECIES Decryption Test ===");
console.log("Private key:", privateKey.substring(0, 10) + "...");
console.log("Encrypted data length:", Buffer.from(encryptedKeyBase64, 'base64').length);
console.log("");

try {
    const decryptedBytes = decryptECIESFromJava(encryptedKeyBase64, privateKey);
    console.log("\n=== Result ===");
    console.log("Decrypted Key (Base64):", decryptedBytes.toString('base64'));
    console.log("Decrypted Key (Hex):", decryptedBytes.toString('hex'));
    console.log("Key length:", decryptedBytes.length, "bytes");
} catch (error) {
    console.error("\n❌ Decryption failed:", error.message);
    console.log("\nPossible issues:");
    console.log("1. The private key doesn't match the public key used for encryption");
    console.log("2. The encrypted data is corrupted");
    console.log("3. Java used a different ECIES variant (try ECIESwithAES-CBC specifically)");
}

module.exports = { decryptECIESFromJava, decryptKeyAsBase64 };