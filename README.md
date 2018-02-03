# Ether Transfer

**Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [License](https://www.apache.org/licenses/LICENSE-2.0) for the specific language governing permissions and
limitations under the License.**

On a computer (to be referred to as the `notary`) with no I/O besides a keyboard, mouse and monitor:

1. Create a new ethereum address
2. Create a signed transaction sending ether to the new address
3. Open the QR code jpg created in the current directory named `transaction-qr-code-DATE.jpg`

On a separate device:

1. Scan the QR code containing the signed transaction hex. The qr code data should start with `0x`.
2. Send the signed transaction hex from the QR code as a text message to the [Twilio Ethereum](https://github.com/timg456789/TwilioEthereum) SMS endpoint
    1. The md5 hash of the signed transaction hex will be returned
    2. The entire transaction must be received as one message
    3. Twilio supports concatenation, but some carriers such as Sprint do not currently support concatenated messages on long code messages. Send the transaction as an MMS by attaching any image to exceed the standard 160 SMS character limit. See [Twilio Ethereum}(https://github.com/timg456789/TwilioEthereum) for more details.
3. Secure the wallet
    1. The computer aka `notary` used to create the address and encrypted wallet should be destroyed or the private key could be leaked
    2. Copy the private key to paper by hand or type writer
    3. Repeat the process when a key has the potential to have been leaked
4. Send a text message to the Twilio Ethereum Endpoint to broadcast the transaction

**Even this strict process only addresses one portion of safely transfering ethereum. The `notary` computer could alter the to address prior to signing and it could even be altered when decrypting if on a malicious machine.**

## Usage

Transfers ethereum between two private keys. Both private keys are stored in a wallet which is encrypted and saved to disk for recovery purposes. The `--path` option can be used to specify a plain-text file to be included as data in the transaction. All transactions have a timestamp placed in the data field.

This application is excellent at placing data onto the blockchain or distributing ethereum among a single entity. This application isn't good to send ethereum between more than a single entity since it operates on private keys.


### Print environment variables

Put private keys in environment variables then access them quickly with this command, which will fail unless called with Administrator privileges.

    npm run print-ether-vars

    // prints
    // private key from process.env.ether_private_key
    // private key from process.env.ether_private_key_2

### Transfer

    npm run transfer-ether --
        --from // private key of sender defaults to process.env.ether_private_key
        --to // private key of recipient defaults to process.env.ether_private_key_2
        --password // an arbitrary password to encrypt the accounts involved in the transfer to disk
        --repeat-password
        --amount // amount in wei or "ALL" without quotes for the entire balance
        --data-path // optional full path to a plain-text file on disk to be included as data
        --provider // optional provider (rinkeby testnet is supported as an alternate to the mainnet)
        --dry-run // optional flag to print and not broadcast the transaction

### Decrypt Wallet

    npm run print-decrypted-wallet --
        --path // full path to the .json file created by "run transfer-ether"
        --password // password provided to "run transfer-ether"

## Setup

### Prerequiesite

In order to fix `npm install` raising the error below, install [windows build tools](https://github.com/ethereum/web3.js/issues/1064) globally: `npm install --global windows-build-tools`

    C:\Users\peon\Desktop\projects\Ether\node_modules\scrypt>if not defined npm_config_node_gyp (node "C:\Program Files\nodejs\node_modules\npm\bin\node-gyp-bin\\..\..\node_modules\node-gyp\bin\node-gyp.js" rebuild )  else (node "" rebuild )
    gyp ERR! configure error
    gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.

## Helpful Projects

[web3 api docs](https://web3js.readthedocs.io/en/1.0/web3-eth.html)

[Ethereum RPC docs](https://github.com/ethereum/wiki/wiki/JSON-RPC)

[MyEtherWallet](https://www.myetherwallet.com/)

[MyEtherApi - web3 provider](https://www.myetherapi.com/)
