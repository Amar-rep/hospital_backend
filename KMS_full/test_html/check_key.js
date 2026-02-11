/**
 * Check what Keccak ID your private key corresponds to
 */

const { keccak256 } = require('js-sha3');
const eccrypto = require('eccrypto');

const privateKeyHex = "bc1d4431962fa069c84eb472a84b1c43f0f68617a7d2022201bbb95c5a954c09";

// Get public key from private key
const privateKey = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
const publicKey = eccrypto.getPublic(privateKey);

console.log("=== Private Key Analysis ===\n");
console.log("Private key:", privateKeyHex);
console.log("Public key (hex):", publicKey.toString('hex'));
console.log("Public key length:", publicKey.length, "bytes\n");

// Calculate Keccak256 of public key (without 0x04 prefix)
const publicKeyWithoutPrefix = publicKey.slice(1); // Remove 0x04 prefix
const keccakHash = keccak256(publicKeyWithoutPrefix);

console.log("Public key (without 0x04 prefix):", publicKeyWithoutPrefix.toString('hex'));
console.log("Keccak256 hash:", keccakHash);
console.log("\n=== Comparison ===");
console.log("Your Keccak ID:", keccakHash);
console.log("Receiver Keccak:", "e218b5d756344ab3d9a6ea54e21f4a8343661147b9251d202366011255968e1c");
console.log("\nMatch:", keccakHash === "e218b5d756344ab3d9a6ea54e21f4a8343661147b9251d202366011255968e1c" ? "✅ YES" : "❌ NO");

if (keccakHash !== "e218b5d756344ab3d9a6ea54e21f4a8343661147b9251d202366011255968e1c") {
    console.log("\n⚠️  PROBLEM: The private key you're using doesn't match the receiver!");
    console.log("\nYou need to:");
    console.log("1. Find the private key that corresponds to Keccak ID: e218b5d756344ab3d9a6ea54e21f4a8343661147b9251d202366011255968e1c");
    console.log("2. Or encrypt the group key for YOUR Keccak ID:", keccakHash);
}
