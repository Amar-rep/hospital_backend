/**
 * Decrypt keys encrypted by Java KeyService.encryptKeyWithPublicKey()
 * 
 * This uses the eccrypto library which is compatible with the updated Java implementation.
 * 
 * Installation: npm install eccrypto
 * 
 * Usage:
 *   const decrypted = await decryptKey(encryptedBase64, privateKeyHex);
 */

const eccrypto = require('eccrypto');

/**
 * Decrypt an encrypted key from Java
 * 
 * @param {string} encryptedBase64 - Base64 encoded encrypted key from Java
 * @param {string} privateKeyHex - Your private key in hex format (with or without 0x prefix)
 * @returns {Promise<Buffer>} - The decrypted key bytes
 */
async function decryptKey(encryptedBase64, privateKeyHex) {
    // Convert private key to Buffer
    const privateKey = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');

    // Decode the encrypted data
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    // Parse the structure: [65: ephemPubKey] + [16: IV] + [ciphertext] + [32: MAC]
    const ephemPublicKey = encrypted.slice(0, 65);
    const iv = encrypted.slice(65, 81);
    const mac = encrypted.slice(-32);
    const ciphertext = encrypted.slice(81, -32);

    // Create eccrypto-compatible structure
    const encryptedData = {
        iv: iv,
        ephemPublicKey: ephemPublicKey,
        ciphertext: ciphertext,
        mac: mac
    };

    // Decrypt using eccrypto
    const decrypted = await eccrypto.decrypt(privateKey, encryptedData);

    return decrypted;
}

/**
 * Convenience function to get the decrypted key as Base64
 */
async function decryptKeyAsBase64(encryptedBase64, privateKeyHex) {
    const decrypted = await decryptKey(encryptedBase64, privateKeyHex);
    return decrypted.toString('base64');
}

/**
 * Convenience function to get the decrypted key as Hex
 */
async function decryptKeyAsHex(encryptedBase64, privateKeyHex) {
    const decrypted = await decryptKey(encryptedBase64, privateKeyHex);
    return decrypted.toString('hex');
}

// Export for use in other modules
module.exports = {
    decryptKey,
    decryptKeyAsBase64,
    decryptKeyAsHex
};

// ========== EXAMPLE USAGE ==========
if (require.main === module) {
    // Example: decrypt a key
    const privateKey = "0xbc1d4431962fa069c84eb472a84b1c43f0f68617a7d2022201bbb95c5a954c09";
    const encryptedKey = "BLwbzUuLjvRopQifqkLziNMkOj9j0sU4EHPpIhNd1MlyhH7cl+uIlSGH5rgzTJBkIOthwCswIfXaCNfdRZoKSPUF0/78VPA6HbSrVyyEDhBjKxhSMuxovYqj78NTQQAobjWOGmsJG/gPvTJKfq4zrEoTZOdbE02BcbAopA/KECmasEMYq89eDEcRsLnj0fruIt9sP3Gearr/2nZBbFnJ4ug=";

    decryptKey(encryptedKey, privateKey)
        .then(decrypted => {
            console.log("✅ Decryption successful!");
            console.log("Decrypted key (Base64):", decrypted.toString('base64'));
            console.log("Decrypted key (Hex):", decrypted.toString('hex'));
        })
        .catch(error => {
            console.error("❌ Decryption failed:", error.message);
        });
}
