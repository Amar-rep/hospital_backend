/**
 * End-to-end test: Encrypt in Java (new method) -> Decrypt in JavaScript
 * 
 * This script:
 * 1. Generates a secp256k1 key pair
 * 2. Calls Java API to encrypt a test key with the NEW encryption
 * 3. Decrypts it using eccrypto
 */

const eccrypto = require('eccrypto');
const crypto = require('crypto');

const API_BASE = 'http://localhost:8081';

/**
 * Decrypt using eccrypto
 */
async function decryptKey(encryptedBase64, privateKeyHex) {
    const privateKey = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    console.log("Encrypted data length:", encrypted.length, "bytes");

    // Parse: [65: ephemPubKey] + [16: IV] + [ciphertext] + [32: MAC]
    const ephemPublicKey = encrypted.slice(0, 65);
    const iv = encrypted.slice(65, 81);
    const mac = encrypted.slice(-32);
    const ciphertext = encrypted.slice(81, -32);

    console.log("  Ephemeral pubkey:", 65, "bytes");
    console.log("  IV:", iv.length, "bytes");
    console.log("  Ciphertext:", ciphertext.length, "bytes");
    console.log("  MAC:", mac.length, "bytes");

    const encryptedData = {
        iv: iv,
        ephemPublicKey: ephemPublicKey,
        ciphertext: ciphertext,
        mac: mac
    };

    return await eccrypto.decrypt(privateKey, encryptedData);
}

/**
 * Generate a key pair and test encryption/decryption
 */
async function testEncryptionDecryption() {
    console.log("=== ECIES Encryption/Decryption Test ===\n");

    // Generate a key pair using eccrypto
    const privateKey = crypto.randomBytes(32);
    const publicKey = eccrypto.getPublic(privateKey);

    const privateKeyHex = privateKey.toString('hex');
    const publicKeyHex = publicKey.toString('hex');

    console.log("Generated key pair:");
    console.log("  Private key:", privateKeyHex.substring(0, 16) + "...");
    console.log("  Public key:", publicKeyHex.substring(0, 20) + "...");
    console.log("  Public key length:", publicKey.length, "bytes\n");

    // Call Java API to encrypt
    console.log("Calling Java API to encrypt a test key...");

    try {
        const response = await fetch(`${API_BASE}/api/user/encrypt-test-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publicKeyHex: publicKeyHex
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API returned ${response.status}: ${text}`);
        }

        const data = await response.json();

        console.log("\nJava API response:");
        console.log("  Original key (Base64):", data.originalKeyBase64);
        console.log("  Encrypted key length:", Buffer.from(data.encryptedKeyBase64, 'base64').length, "bytes");
        console.log("  Encrypted (first 40 chars):", data.encryptedKeyBase64.substring(0, 40) + "...\n");

        // Decrypt with JavaScript
        console.log("Decrypting with JavaScript eccrypto...");
        const decrypted = await decryptKey(data.encryptedKeyBase64, privateKeyHex);

        console.log("\n=== RESULT ===");
        console.log("Decrypted key (Base64):", decrypted.toString('base64'));
        console.log("Decrypted key (Hex):", decrypted.toString('hex'));

        // Verify
        if (decrypted.toString('base64') === data.originalKeyBase64) {
            console.log("\n✅ SUCCESS! Encryption/Decryption works perfectly!");
            console.log("The Java encryption is now compatible with JavaScript decryption.");
        } else {
            console.log("\n❌ MISMATCH!");
            console.log("Expected:", data.originalKeyBase64);
            console.log("Got:", decrypted.toString('base64'));
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);

        if (error.message.includes('404') || error.message.includes('500')) {
            console.log("\nThe Java server doesn't have the test endpoint yet.");
            console.log("You need to:");
            console.log("1. Add a test endpoint to UserController or create a TestController");
            console.log("2. Restart the Java server");
            console.log("\nOr you can manually test by:");
            console.log("1. Getting an encrypted key from your existing API");
            console.log("2. Using the decrypt_final.js script to decrypt it");
        }
    }
}

// Run the test
testEncryptionDecryption().catch(console.error);
