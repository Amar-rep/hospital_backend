/**
 * Test the actual encrypted key from your server
 */

const eccrypto = require('eccrypto');

async function testRealKey() {
    console.log("=== Testing Real Encrypted Key ===\n");

    // Your data
    const encryptedGroupKey = "BIpC21maIOf5GkA2WOPljJ59cJdeD0cpcLGA9jf+TaUUF7QWhGwUPWmhRFDzFu7d5zxqstLqAU/XIbiEzu7ZwjWQWW8FV/0LBBRmm3QyiMEAgM2n5/hRiHDh3d1roJtRdMUkFET3cSTyJ/RVBYnUBsXpsC9jmawmz32fr0EOeuUcd49EpxNIF8OrftALt36IfzbB5qd9Rz0s0PwIFCmcxrk=";
    const expectedGroupKey = "sLkK/1LOpYSwqXVP6/kI/uH83b/TtSKki16y7fH5GmI=";
    const receiverKeccak = "e218b5d756344ab3d9a6ea54e21f4a8343661147b9251d202366011255968e1c";

    // You need the PRIVATE KEY for this receiverKeccak
    // This is just a placeholder - replace with the actual private key
    const privateKeyHex = "bc1d4431962fa069c84eb472a84b1c43f0f68617a7d2022201bbb95c5a954c09";

    console.log("Expected group key (Base64):", expectedGroupKey);
    console.log("Receiver Keccak:", receiverKeccak);
    console.log("Private key:", privateKeyHex.substring(0, 16) + "...\n");

    // Analyze the encrypted data
    const encrypted = Buffer.from(encryptedGroupKey, 'base64');
    console.log("Encrypted data analysis:");
    console.log("  Total length:", encrypted.length, "bytes");

    // Expected format: [65: ephemPubKey] + [16: IV] + [ciphertext] + [32: MAC]
    const ephemPublicKey = encrypted.slice(0, 65);
    const iv = encrypted.slice(65, 81);
    const mac = encrypted.slice(-32);
    const ciphertext = encrypted.slice(81, -32);

    console.log("  Ephemeral pubkey:", ephemPublicKey.length, "bytes, starts with:", ephemPublicKey[0].toString(16));
    console.log("  IV:", iv.length, "bytes");
    console.log("  Ciphertext:", ciphertext.length, "bytes");
    console.log("  MAC:", mac.length, "bytes\n");

    // Check if the first byte is 0x04 (uncompressed EC point)
    if (ephemPublicKey[0] !== 0x04) {
        console.log("⚠️  WARNING: Ephemeral public key doesn't start with 0x04!");
        console.log("   This might not be the expected format.\n");
    }

    // Try to decrypt
    const privateKey = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');

    const encryptedData = {
        iv: iv,
        ephemPublicKey: ephemPublicKey,
        ciphertext: ciphertext,
        mac: mac
    };

    try {
        console.log("Attempting decryption...");
        const decrypted = await eccrypto.decrypt(privateKey, encryptedData);

        console.log("\n✅ SUCCESS!");
        console.log("Decrypted group key (Base64):", decrypted.toString('base64'));
        console.log("Decrypted group key (Hex):", decrypted.toString('hex'));

        if (decrypted.toString('base64') === expectedGroupKey) {
            console.log("\n🎉 PERFECT! Decrypted key matches expected key!");
        } else {
            console.log("\n⚠️  Decrypted but doesn't match expected:");
            console.log("   Expected:", expectedGroupKey);
            console.log("   Got:", decrypted.toString('base64'));
        }

    } catch (error) {
        console.log("\n❌ Decryption failed:", error.message);

        if (error.message.includes('Bad MAC')) {
            console.log("\nPossible causes:");
            console.log("1. The private key doesn't match the public key used for encryption");
            console.log("   - receiverKeccak:", receiverKeccak);
            console.log("   - Make sure you're using the correct private key for this Keccak ID");
            console.log("\n2. The Java server wasn't restarted after the code update");
            console.log("   - This encrypted key might still use the OLD encryption method");
            console.log("   - Restart the server and generate a NEW encrypted key");
            console.log("\n3. The encryption format doesn't match");
            console.log("   - Check that Java is using the updated encryptKeyWithPublicKey method");
        }
    }
}

testRealKey().catch(console.error);
