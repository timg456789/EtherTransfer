const url = require('url');
const https = require('https');
const Jsonrpc = require('web3-core-requestmanager/src/jsonrpc');
function EthClient(provider) {
    this.promiseToPost = function (method, params) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(Jsonrpc.toPayload(method, params));
            let options = url.parse(provider);
            options.method = 'POST';
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk)
                    .on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', (e) => {
                reject(`problem with request: ${e.message}`);
            });
            req.write(postData);
            req.end();
        });
    };
    this.promiseToSendSignedTransaction = function (transactionHex) {
        return this.promiseToPost("eth_sendRawTransaction", [transactionHex])
    };
    this.promiseToGetBalance = function (address) {
        return this.promiseToPost("eth_getBalance", [address,"latest"]);
    }
}
module.exports = EthClient;