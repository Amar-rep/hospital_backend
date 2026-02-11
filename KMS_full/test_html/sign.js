const { Wallet } = require("ethers");

// 1. Your Credentials
const credentials = {
    "privateKey": "0xd4555ebdac4cfe94afb1fd4f602f226ed2d290ac79ec220c23df79200a513c6d",
    "publicKey": "0x5043090e2f03290e98c099e23412881444b8be04e0c3dfe86c1d0977f257ef6e72dfbf8d36a48048bd25e29b6a0837c70056d4a10a3fa335691d0b5c14861110"
}


const nonce = "nonce";

async function signData() {
    try {
        const wallet = new Wallet(credentials.privateKey);

        // 2. Generate the signature (returns Hex string starting with 0x)
        const signatureHex = await wallet.signMessage(nonce);

        // 3. Convert Hex to Base64
        // We remove the '0x' prefix from the start of the hex string
        const signatureBase64 = Buffer.from(signatureHex.slice(2), 'hex').toString('base64');

        console.log("--- Signature Results ---");
        console.log("Nonce:     ", nonce);
        console.log("Hex:       ", signatureHex);
        console.log("Base64:    ", signatureBase64);

    } catch (error) {
        console.error("Signing failed:", error);
    }
}

signData();