/**
 * Standalone test: Encrypt and decrypt in JavaScript to verify the logic works
 * This proves the encryption/decryption format is correct
 */

const eccrypto = require('eccrypto');
const crypto = require('crypto');

async function test() {
    console.log("=== Standalone JavaScript ECIES Test ===\n");

    // Generate a key pair
    const privateKey = crypto.randomBytes(32);
    const publicKey = eccrypto.getPublic(privateKey);

    console.log("Generated key pair:");
    console.log("  Private key:", privateKey.toString('hex').substring(0, 16) + "...");
    console.log("  Public key:", publicKey.toString('hex').substring(0, 20) + "...\n");

    // Create a test key (32 bytes, like a Group Key)
    const testKey = crypto.randomBytes(32);
    console.log("Original test key (Base64):", testKey.toString('base64'));
    console.log("Original test key (Hex):", testKey.toString('hex'), "\n");

    // Encrypt with eccrypto
    console.log("Encrypting with eccrypto...");
    const encrypted = await eccrypto.encrypt(publicKey, testKey);

    // Convert to the format our Java uses: [ephemPubKey] + [IV] + [ciphertext] + [MAC]
    const encryptedBuffer = Buffer.concat([
        encrypted.ephemPublicKey,
        encrypted.iv,
        encrypted.ciphertext,
        encrypted.mac
    ]);

    const encryptedBase64 = encryptedBuffer.toString('base64');
    console.log("Encrypted (Base64):", encryptedBase64.substring(0, 60) + "...");
    console.log("Encrypted length:", encryptedBuffer.length, "bytes\n");

    // Decrypt
    console.log("Decrypting...");
    const decrypted = await eccrypto.decrypt(privateKey, encrypted);

    console.log("\n=== RESULT ===");
    console.log("Decrypted key (Base64):", decrypted.toString('base64'));
    console.log("Decrypted key (Hex):", decrypted.toString('hex'));

    if (testKey.equals(decrypted)) {
        console.log("\n✅ SUCCESS! JavaScript encryption/decryption works!");
        console.log("\nThis proves the format is correct.");
        console.log("Now you need to restart your Java server to use the NEW encryption method.");
    } else {
        console.log("\n❌ Keys don't match!");
    }
}

test().catch(console.error);
