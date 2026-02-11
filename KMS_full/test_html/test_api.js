/**
 * End-to-end test script for ECIES encryption/decryption
 * 
 * This script:
 * 1. Generates a secp256k1 key pair
 * 2. Sends the public key to Java backend to encrypt a test key
 * 3. Attempts to decrypt using the private key
 * 
 * Usage:
 * 1. Start the Java KMS server
 * 2. Run: node test_api.js
 */

const crypto = require('crypto');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

const API_BASE = 'http://localhost:8081';

/**
 * KDF2 Key Derivation Function with SHA-1
 */
function kdf2(sharedSecret, outputLen) {
    const output = Buffer.alloc(outputLen);
    let counter = 1;
    let offset = 0;

    while (offset < outputLen) {
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
 * Analyze the encrypted buffer structure
 */
function analyzeBuffer(fullBuffer) {
    console.log("\n=== Buffer Analysis ===");
    console.log("Total length:", fullBuffer.length, "bytes");
    console.log("First byte:", fullBuffer[0].toString(16), "(should be 04 for uncompressed EC point)");

    // Expected: [65 pubkey] + [?? payload] + [20 MAC]
    console.log("Ephemeral public key (65 bytes):", fullBuffer.slice(0, 65).toString('hex').substring(0, 40), "...");
    const remaining = fullBuffer.length - 65 - 20;
    console.log("Payload + MAC remaining bytes:", remaining + 20);
    console.log("MAC (last 20 bytes):", fullBuffer.slice(-20).toString('hex'));

    if (remaining === 32) {
        console.log("=> Payload is 32 bytes (same as key size) - likely XOR encryption");
    } else if (remaining === 48) {
        console.log("=> Payload is 48 bytes = 16 (IV) + 32 (ciphertext) - likely AES-CBC");
    } else if (remaining === 16 + 48) {
        console.log("=> Payload is 64 bytes = 16 (IV) + 48 (AES padded) - AES-CBC with padding");
    }
}

/**
 * Attempt decryption with multiple approaches
 */
function decryptECIES(base64Data, privateKeyHex) {
    const fullBuffer = Buffer.from(base64Data, 'base64');

    analyzeBuffer(fullBuffer);

    // Parse structure
    const ephemeralPubKey = fullBuffer.slice(0, 65);
    const macReceived = fullBuffer.slice(-20);
    const payload = fullBuffer.slice(65, -20);

    // ECDH
    const privKey = ec.keyFromPrivate(privateKeyHex.replace('0x', ''), 'hex');
    const pubKey = ec.keyFromPublic(ephemeralPubKey);
    const sharedSecret = privKey.derive(pubKey.getPublic());
    const sharedSecretBuffer = Buffer.from(sharedSecret.toArray('be', 32));

    console.log("\n=== ECDH ===");
    console.log("Shared secret:", sharedSecretBuffer.toString('hex').substring(0, 32), "...");

    // Try all approaches
    const approaches = [
        { name: "XOR (payload as plaintext length)", fn: () => tryXOR(payload, macReceived, sharedSecretBuffer, payload.length) },
        { name: "XOR (32 bytes)", fn: () => tryXOR(payload, macReceived, sharedSecretBuffer, 32) },
        { name: "AES-CBC + IV (16+payload)", fn: () => tryAESWithIV(payload, macReceived, sharedSecretBuffer) },
        { name: "AES-CBC zero IV", fn: () => tryAESZeroIV(payload, macReceived, sharedSecretBuffer) },
    ];

    for (const approach of approaches) {
        try {
            console.log(`\nTrying: ${approach.name}`);
            const result = approach.fn();
            console.log("✅ Success!");
            return result;
        } catch (e) {
            console.log(`   Failed: ${e.message}`);
        }
    }

    throw new Error("All decryption approaches failed");
}

function tryXOR(payload, macReceived, sharedSecret, plaintextLen) {
    const derivedLen = plaintextLen + 20; // encryption key + MAC key
    const derivedKey = kdf2(sharedSecret, derivedLen);
    const encKey = derivedKey.slice(0, plaintextLen);
    const macKey = derivedKey.slice(plaintextLen);

    // Verify MAC
    const calcMac = crypto.createHmac('sha1', macKey).update(payload).digest();
    if (!calcMac.equals(macReceived)) {
        throw new Error("MAC mismatch");
    }

    // XOR decrypt
    const plaintext = Buffer.alloc(plaintextLen);
    for (let i = 0; i < plaintextLen; i++) {
        plaintext[i] = payload[i] ^ encKey[i];
    }
    return plaintext;
}

function tryAESWithIV(payload, macReceived, sharedSecret) {
    const iv = payload.slice(0, 16);
    const ciphertext = payload.slice(16);

    const derivedKey = kdf2(sharedSecret, 36); // 16 AES + 20 MAC
    const aesKey = derivedKey.slice(0, 16);
    const macKey = derivedKey.slice(16);

    // Try MAC over ciphertext only
    const calcMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calcMac.equals(macReceived)) {
        // Try MAC over full payload
        const calcMac2 = crypto.createHmac('sha1', macKey).update(payload).digest();
        if (!calcMac2.equals(macReceived)) {
            throw new Error("MAC mismatch");
        }
    }

    const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function tryAESZeroIV(ciphertext, macReceived, sharedSecret) {
    const derivedKey = kdf2(sharedSecret, 36);
    const aesKey = derivedKey.slice(0, 16);
    const macKey = derivedKey.slice(16);

    const calcMac = crypto.createHmac('sha1', macKey).update(ciphertext).digest();
    if (!calcMac.equals(macReceived)) {
        throw new Error("MAC mismatch");
    }

    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ========== MAIN TEST ==========

async function main() {
    console.log("=== ECIES End-to-End Test ===\n");

    // Generate key pair
    const keyPair = ec.genKeyPair();
    const privateKeyHex = keyPair.getPrivate('hex');
    const publicKeyHex = Buffer.from(keyPair.getPublic('array')).toString('hex');

    console.log("Generated key pair:");
    console.log("  Private key:", privateKeyHex.substring(0, 16), "...");
    console.log("  Public key:", publicKeyHex.substring(0, 20), "...");

    // Call Java API
    console.log("\nCalling Java API to encrypt...");

    try {
        const response = await fetch(`${API_BASE}/api/test-crypto/encrypt-fixed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKeyHex })
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log("\nJava response:");
        console.log("  Original key (Base64):", data.originalKeyBase64);
        console.log("  Original key (Hex):", data.originalKeyHex);
        console.log("  Encrypted length:", data.encryptedLength, "bytes");
        console.log("  Encrypted (Base64):", data.encryptedKeyBase64.substring(0, 40), "...");

        // Attempt decryption
        console.log("\nAttempting decryption...");
        const decrypted = decryptECIES(data.encryptedKeyBase64, privateKeyHex);

        console.log("\n=== RESULT ===");
        console.log("Decrypted (Hex):", decrypted.toString('hex'));
        console.log("Decrypted (Base64):", decrypted.toString('base64'));

        // Verify
        const expectedHex = data.originalKeyHex.replace('0x', '');
        if (decrypted.toString('hex') === expectedHex) {
            console.log("\n✅ SUCCESS: Decrypted key matches original!");
        } else {
            console.log("\n❌ MISMATCH:");
            console.log("  Expected:", expectedHex);
            console.log("  Got:", decrypted.toString('hex'));
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.log("\nMake sure the Java KMS server is running on", API_BASE);
    }
}

main().catch(console.error);
