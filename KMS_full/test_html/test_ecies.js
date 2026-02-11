const crypto = require('crypto');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

/**
 * Test script to verify ECIES encryption/decryption compatibility with Java BouncyCastle
 */

// Generate a test key pair
const keyPair = ec.genKeyPair();
const privateKeyHex = keyPair.getPrivate('hex');
// Get uncompressed public key (65 bytes, starts with 04)
const publicKeyBytes = Buffer.from(keyPair.getPublic('array'));
const publicKeyHex = publicKeyBytes.toString('hex');

console.log("=== Generated Test Keys ===");
console.log("Private Key (hex):", privateKeyHex);
console.log("Public Key (hex):", publicKeyHex);
console.log("Public Key length:", publicKeyBytes.length, "bytes");
console.log("");

/**
 * Encrypt using ECIES (matching Java BouncyCastle default)
 * Output format: [65: EphemeralPubKey] + [Ciphertext XOR] + [20: HMAC-SHA1]
 */
function encryptECIES(plaintext, recipientPublicKeyBytes) {
    const plaintextBuf = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext);
    const pubKeyBuf = Buffer.isBuffer(recipientPublicKeyBytes)
        ? recipientPublicKeyBytes
        : Buffer.from(recipientPublicKeyBytes, 'hex');

    // 1. Generate ephemeral key pair
    const ephemeralKeyPair = ec.genKeyPair();
    const ephemeralPubKey = Buffer.from(ephemeralKeyPair.getPublic('array')); // 65 bytes uncompressed

    // 2. ECDH with recipient's public key
    const recipientPubKey = ec.keyFromPublic(pubKeyBuf);
    const sharedSecret = ephemeralKeyPair.derive(recipientPubKey.getPublic());
    const sharedSecretBuffer = Buffer.from(sharedSecret.toArray('be', 32));

    // 3. KDF2 with SHA-1
    function kdf2Sha1(secret, outputLen) {
        const output = Buffer.alloc(outputLen);
        let counter = 1;
        let offset = 0;

        while (offset < outputLen) {
            const counterBuf = Buffer.alloc(4);
            counterBuf.writeUInt32BE(counter);

            const hash = crypto.createHash('sha1');
            hash.update(secret);
            hash.update(counterBuf);
            const digest = hash.digest();

            const bytesToCopy = Math.min(digest.length, outputLen - offset);
            digest.copy(output, offset, 0, bytesToCopy);
            offset += bytesToCopy;
            counter++;
        }

        return output;
    }

    const keyLen = plaintextBuf.length + 20;
    const derivedKey = kdf2Sha1(sharedSecretBuffer, keyLen);
    const encryptionKey = derivedKey.slice(0, plaintextBuf.length);
    const macKey = derivedKey.slice(plaintextBuf.length);

    // 4. XOR encryption
    const ciphertext = Buffer.alloc(plaintextBuf.length);
    for (let i = 0; i < plaintextBuf.length; i++) {
        ciphertext[i] = plaintextBuf[i] ^ encryptionKey[i];
    }

    // 5. HMAC-SHA1
    const mac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();

    // 6. Combine: [EphemeralPubKey(65)] + [Ciphertext] + [MAC(20)]
    return Buffer.concat([ephemeralPubKey, ciphertext, mac]);
}

/**
 * Decrypt ECIES (matching Java BouncyCastle default)
 */
function decryptECIES(encryptedData, privateKeyHex) {
    const fullBuffer = Buffer.isBuffer(encryptedData) ? encryptedData : Buffer.from(encryptedData, 'base64');

    // 1. Parse structure
    const ephemeralPubKeyBytes = fullBuffer.slice(0, 65);
    const macReceived = fullBuffer.slice(fullBuffer.length - 20);
    const ciphertext = fullBuffer.slice(65, fullBuffer.length - 20);

    // 2. ECDH
    const privKey = ec.keyFromPrivate(privateKeyHex.replace('0x', ''), 'hex');
    const ephemeralPubKey = ec.keyFromPublic(ephemeralPubKeyBytes);
    const sharedSecret = privKey.derive(ephemeralPubKey.getPublic());
    const sharedSecretBuffer = Buffer.from(sharedSecret.toArray('be', 32));

    // 3. KDF2 with SHA-1
    function kdf2Sha1(secret, outputLen) {
        const output = Buffer.alloc(outputLen);
        let counter = 1;
        let offset = 0;

        while (offset < outputLen) {
            const counterBuf = Buffer.alloc(4);
            counterBuf.writeUInt32BE(counter);

            const hash = crypto.createHash('sha1');
            hash.update(secret);
            hash.update(counterBuf);
            const digest = hash.digest();

            const bytesToCopy = Math.min(digest.length, outputLen - offset);
            digest.copy(output, offset, 0, bytesToCopy);
            offset += bytesToCopy;
            counter++;
        }

        return output;
    }

    const keyLen = ciphertext.length + 20;
    const derivedKey = kdf2Sha1(sharedSecretBuffer, keyLen);
    const encryptionKey = derivedKey.slice(0, ciphertext.length);
    const macKey = derivedKey.slice(ciphertext.length);

    // 4. Verify MAC
    const calculatedMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calculatedMac.equals(macReceived)) {
        throw new Error('MAC verification failed');
    }

    // 5. XOR decryption
    const plaintext = Buffer.alloc(ciphertext.length);
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = ciphertext[i] ^ encryptionKey[i];
    }

    return plaintext;
}

// ========== TEST ==========
console.log("=== Testing JavaScript ECIES Encryption/Decryption ===");

// Simulate a 32-byte AES-256 key (like Group Key)
const originalKey = crypto.randomBytes(32);
console.log("Original Key (hex):", originalKey.toString('hex'));
console.log("Original Key (base64):", originalKey.toString('base64'));

// Encrypt
const encrypted = encryptECIES(originalKey, publicKeyBytes);
const encryptedBase64 = encrypted.toString('base64');
console.log("\nEncrypted (base64):", encryptedBase64);
console.log("Encrypted length:", encrypted.length, "bytes");

// Decrypt
try {
    const decrypted = decryptECIES(encryptedBase64, privateKeyHex);
    console.log("\nDecrypted Key (hex):", decrypted.toString('hex'));
    console.log("Decrypted Key (base64):", decrypted.toString('base64'));

    if (originalKey.equals(decrypted)) {
        console.log("\n✅ SUCCESS: Original and decrypted keys match!");
    } else {
        console.log("\n❌ FAILURE: Keys don't match!");
    }
} catch (err) {
    console.error("\n❌ Decryption error:", err.message);
}

console.log("\n=== Use these values to test with Java ===");
console.log("Copy this public key to Java for encryption:");
console.log("  Public Key (hex):", publicKeyHex);
console.log("\nThen decrypt with this private key:");
console.log("  Private Key (hex):", privateKeyHex);

module.exports = { encryptECIES, decryptECIES };
