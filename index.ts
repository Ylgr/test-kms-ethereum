import { AwsKmsSigner } from "@cloud-cryptographic-wallet/aws-kms-signer";
import { EthersAdapter } from '@cloud-cryptographic-wallet/ethers-adapter';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();
async function main() {
    const keyId = process.env.AWS_KMS_KEY_ID || '';
    const credentials = await fromSSO({ profile: process.env.AWS_SSO_PROFILE })();
    const awsKmsSigner = new AwsKmsSigner(keyId, { region: process.env.AWS_REGION, credentials });
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545'); // BSC testnet
    const signer = new EthersAdapter({ signer: awsKmsSigner }).connect(provider);

    const address = await signer.getAddress();
    console.log('address', address);
    console.log(ethers.utils.formatEther(await provider.getBalance(address)).toString());

    const message = 'Hello World';
    const signature1 = await signer.signMessage(message);
    console.log('signature1', signature1);
    const signature2 = await signer.signMessage(message);
    console.log('signature2', signature2);

    const recoverAddress1 = ethers.utils.verifyMessage(message, signature1);
    console.log('recoverAddress1', recoverAddress1);
    const recoverAddress2 = ethers.utils.verifyMessage(message, signature2);
    console.log('recoverAddress2', recoverAddress2);

    const tx = await signer.sendTransaction({
        from: address,
        to: address,
    });

    console.log({ tx });

    const receipt = await tx.wait();

    console.log({ receipt });
}


main().then(() => {
    console.log('done');
}).catch((err) => {
    console.error(err);
});
