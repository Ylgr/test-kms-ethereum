const {
    KMSClient
} = require("@aws-sdk/client-kms");
const { ethers } = require('ethers');
require('dotenv').config();

// Replace with your AWS region and the CMK ID
const region = process.env.AWS_REGION;
const cmkId = process.env.KMS_CMK_ID;

// Initialize KMS client
const client = new KMSClient({ region });

// Generate random data using the CMK
const main = async () => {
    const response = await client.generateRandom({NumberOfBytes: 32, CustomKeyStoreId: cmkId});
    const key = response.Plaintext;
    console.log(key);
}

main().then(() => console.log("Done")).catch((err) => console.error(err, err.stack));
