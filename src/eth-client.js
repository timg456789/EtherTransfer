const url = require('url');
const https = require('https');

function EthClient(provider) {
    this.promiseToPost = function (method, params) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({jsonrpc: '2.0', method: method, params: params, id: 1});
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
    this.promiseToGetBalance = function (address) {
        return this.promiseToPost("eth_getBalance", [address,"latest"]);
    }
}
module.exports = EthClient;