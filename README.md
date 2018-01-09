# Ether

**Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [License](https://www.apache.org/licenses/LICENSE-2.0) for the specific language governing permissions and
limitations under the License.**

## Usage

Transfers ethereum between two private keys. Both private keys are stored in a wallet which is encrypted and saved to disk for recovery purposes. The `--path` option can be used to specify a plain-text file to be included as data in the transaction. All transactions have a timestamp placed in the data field.

This application is excellent at placing data onto the blockchain or distributing ethereum among a single entity. This application isn't good to send ethereum between more than a single entity since it operates on private keys.


### Print environment variables

Put ethereum in environment variables then access them quickly with this command, which will fail unless called with Administrator privileges.

    npm run print-ether-vars

    // prints
    // private key from process.env.ether_private_key
    // private key from process.env.ether_private_key_2

### Transfer

    npm run transfer-ether --
        --from // private key of sender
        --to // private key of recipient
        --password // an arbitrary password to encrypt the accounts involved in the transfer to disk
        --amount // amount in wei or "ALL" without quotes for the entire balance
        --path // full path to a plain-text file on disk to be included as data

### Decrypt Wallet

    npm run print-decrypted-wallet --
        --path // full path from "run transfer-ether"
        --password // password from "run transfer-ether"

## Setup

### Prerequiesite to Run NPM Install

First install [windows build tools](https://github.com/ethereum/web3.js/issues/1064) globally. `npm install --global windows-build-tools` to fix the error below.

    C:\Users\peon\Desktop\projects\Ether\node_modules\scrypt>if not defined npm_config_node_gyp (node "C:\Program Files\nodejs\node_modules\npm\bin\node-gyp-bin\\..\..\node_modules\node-gyp\bin\node-gyp.js" rebuild )  else (node "" rebuild )
    gyp ERR! configure error
    gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.

## Helpful Projects

[MyEtherWallet](https://www.myetherwallet.com/)

[https://www.myetherapi.com/](https://www.myetherapi.com/)

[web3 docs](https://web3js.readthedocs.io/en/1.0/web3-eth.html)
