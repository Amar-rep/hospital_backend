/**
 * ECIES Decryption using eccrypto library
 * 
 * This is the RECOMMENDED approach for decrypting ECIES data from 
 * Java BouncyCastle when using secp256k1 keys (Ethereum-compatible).
 * 
 * The eccrypto library handles all the complexity of:
 * - KDF derivation
 * - AES encryption/decryption  
 * - MAC verification
 * 
 * Installation: npm install eccrypto
 * 
 * IMPORTANT: If eccrypto doesn't work directly with BouncyCastle output,
 * you may need to modify the Java side to use compatible IESParameters.
 */

const eccrypto = require('eccrypto');

// Your private key (32 bytes in hex)
const privateKeyHex = "bc1d4431962fa069c84eb472a84b1c43f0f68617a7d2022201bbb95c5a954c09";

// Convert hex to Buffer
function hexToBuffer(hex) {
    return Buffer.from(hex.replace('0x', ''), 'hex');
}

/**
 * Parse BouncyCastle ECIES output format into eccrypto compatible structure
 * 
 * BC format: [65: EphemeralPubKey] + [payload] + [20: MAC]
 * eccrypto expects: { iv, ephemPublicKey, ciphertext, mac }
 */
function parseBCFormat(base64Data) {
    const fullBuffer = Buffer.from(base64Data, 'base64');

    // BouncyCastle default ECIES structure
    const ephemeralPubKey = fullBuffer.slice(0, 65);
    const mac = fullBuffer.slice(-20);
    const payload = fullBuffer.slice(65, -20);

    console.log("Parsed BC format:");
    console.log("  Total length:", fullBuffer.length);
    console.log("  Ephemeral public key (65 bytes)");
    console.log("  Payload:", payload.length, "bytes");
    console.log("  MAC:", mac.length, "bytes (HMAC-SHA1)");

    // Check if payload contains IV (first 16 bytes could be IV for AES-CBC)
    if (payload.length >= 16) {
        const possibleIv = payload.slice(0, 16);
        const ciphertext = payload.slice(16);

        return {
            iv: possibleIv,
            ephemPublicKey: ephemeralPubKey,
            ciphertext: ciphertext.length > 0 ? ciphertext : payload,
            mac: mac
        };
    }

    return {
        iv: Buffer.alloc(16, 0), // Zero IV if not included
        ephemPublicKey: ephemeralPubKey,
        ciphertext: payload,
        mac: mac
    };
}

/**
 * Try to decrypt using eccrypto library
 */
async function decryptWithEccrypto(base64Data, privKeyHex) {
    const privateKey = hexToBuffer(privKeyHex);
    const parsed = parseBCFormat(base64Data);

    console.log("\nAttempting eccrypto decryption...");

    try {
        const decrypted = await eccrypto.decrypt(privateKey, parsed);
        return decrypted;
    } catch (err) {
        console.log("eccrypto direct approach failed:", err.message);

        // Try alternative parsing
        const fullBuffer = Buffer.from(base64Data, 'base64');

        // Maybe the IV is NOT included (XOR-based ECIES)
        const altParsed = {
            iv: Buffer.alloc(16, 0),
            ephemPublicKey: fullBuffer.slice(0, 65),
            ciphertext: fullBuffer.slice(65, -20),
            mac: fullBuffer.slice(-20)
        };

        try {
            const decrypted = await eccrypto.decrypt(privateKey, altParsed);
            return decrypted;
        } catch (err2) {
            throw new Error("All eccrypto approaches failed: " + err2.message);
        }
    }
}

// ========== TEST ==========

const encryptedKeyBase64 = "BBEnzaBzD9ZwhdEeFaP77LBxme77stNzbgMp8GawKjEvEKgcJLNBahDe+gZgUroqPXWyoRZik7izCNl7P8VxDSmhtTNrZ/NCKll00qcyzRwMhtJgsvxP8mIwgabKrSfr/fp+HKWqoFc6p7Hw10ocKqaCMceJDthEvWgMB2MsdV03+yS/A+m7ARzB+D3nD2um8pKgKTo=";

console.log("=== ECIES Decryption with eccrypto ===\n");

decryptWithEccrypto(encryptedKeyBase64, privateKeyHex)
    .then(decrypted => {
        console.log("\n✅ SUCCESS!");
        console.log("Decrypted key (hex):", decrypted.toString('hex'));
        console.log("Decrypted key (base64):", decrypted.toString('base64'));
    })
    .catch(err => {
        console.log("\n❌ Decryption failed:", err.message);
        console.log("\nRECOMMENDATION:");
        console.log("Since the direct approach isn't working, you have two options:");
        console.log("");
        console.log("1. MODIFY JAVA (recommended): Change the encryption algorithm to a well-documented format:");
        console.log('   Change: Cipher.getInstance("ECIES", "BC")');
        console.log('   To:     Cipher.getInstance("ECIESwithAES-CBC", "BC")');
        console.log("");
        console.log("2. USE eth-crypto: npm install eth-crypto");
        console.log("   This library works natively with ethers.js private keys");
    });
