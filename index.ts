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
    // console.log('signature1', signature1);
    // // const signature2 = await signer.signMessage(message);
    // // console.log('signature2', signature2);
    // // '0xfcd7484290ee95323fbe4f2d2915580aac71436b185b0b6d4cdf0c53f134c2a33f7c0445459029670c14ed7ac68388d3f1bb8ece8a4632a4c9886ba84fb1e6d41b'
    // // '0xfcd7484290ee95323fbe4f2d2915580aac71436b185b0b6d4cdf0c53f134c2a33f7c0445459029670c14ed7ac68388d3f1bb8ece8a4632a4c9886ba84fb1e6d41b'
    // const signature2 = '0x37bd3969c2d80da648c348764803c6a43b793b609e44b003570255a81807ea8d757b845e8dc3f220c9708d5d13a1e080024aa019c1fa680a6f480e8b6487e9011c';
    //
    // const recoverAddress1 = ethers.utils.verifyMessage(message, signature1);
    // console.log('recoverAddress1', recoverAddress1);
    // const recoverAddress2 = ethers.utils.verifyMessage(message, signature2);
    // console.log('recoverAddress2', recoverAddress2);
    // console.log('gasPrice', (await provider.getGasPrice()).toString());
    const gasPrice = provider.getGasPrice();
    const gasLimit = provider.estimateGas({
        from: address,
        to: address,
        value: 0,
        data: '0x00',
    });

    const tx = await signer.signTransaction({
        from: address,
        to: address,
        value: 0,
        data: '0x00',
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        nonce: await provider.getTransactionCount(address),
    });
    //
    // const tx = await signer.sendTransaction({
    //     from: address,
    //     to: address,
    // });

    console.log({ tx });

    // const receipt = await tx.wait();
    //
    // console.log({ receipt });
}


async function benchmark(func: () => void) {
    const start = performance.now();
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(func());
    }
    await Promise.all(requests);
    const end = performance.now();
    console.log('time', end - start);
}

benchmark(main).then(() => {
    console.log('done');
}).catch((err) => {
    console.error(err);
});
