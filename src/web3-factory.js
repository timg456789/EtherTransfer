const Web3 = require('web3');
const Eth = require('web3-eth');

function Web3Factory(provider) {
    this.createWeb3Eth = () => {
        let web3 = new Web3(provider);
        let eth = new Eth(provider);
        return web3;
    };
}
module.exports = Web3Factory;