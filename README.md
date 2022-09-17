# EMV QR Code Tools

Typescript module to create and parse EMV QR Code. Pix & EthereumTransaction support.

## Install

```bash
yarn add emvqrcode-tools
```

## Usage
### Static PixBrCode

```ts
import {PixBrCode} from "emvqrcode-tools"

const run = async ()=>{
    const brCode = new PixBrCode({
        pixKey: "PIX_KEY_HERE",
        additionalInfo: "Some message",
        merchantName: "Guilherme Henrique",
        merchantCity: "Sao Paulo",
        postalCode: "086300000",
        transactionAmount: "10.01",
        referenceLabel: "foo123bar"
    })
    console.log(brCode.get())
}

run()
```
### Static EthereumTransactionCode

```ts
import { EthereumCode } from "emvqrcode-tools"
import Web3 from "web3"
import { toChecksumAddress, toWei } from "web3-utils"

const run = async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s3.binance.org:8545"))
    const defaultGas = "21000"
    const from = toChecksumAddress("0xFROM_ADDRESS")
    const to = toChecksumAddress("0xTO_ADDRESS")
    const value = toWei("0.000171")
    const gasPrice = toWei("15", "Gwei")
    const nonce = await web3.eth.getTransactionCount(from, "pending")

    const ethereumCode = new EthereumCode({
        transactionConfig: {
            nonce,
            from,
            to,
            chainId: 97,
            value,
            gas: defaultGas,
            gasPrice,
            data: "0xa9059cbb000000000000000000000000ab518cd35e0cc361fe7687c3cf6b81147aa62d740000000000000000000000000000000000000000000000008ac7230489e80000"
        },
        provider: {
            host: "https://data-seed-prebsc-1-s3.binance.org:8545"
        },
        additionalInfo: "Some message",
        merchantName: "Guilherme Henrique",
        merchantCity: "São Paulo",
        postalCode: "086300000"
    })

    const code = ethereumCode.get()
    console.log(code)

    console.log(EthereumCode.parse(code))

}

run()
```


## References

- [EMV QRCPS–MPM QRCodes for Payment Systems – Merchant Presented Mod](https://www.emvco.com/terms-of-use/?u=/wp-content/uploads/documents/EMVCo-Merchant-Presented-QR-Specification-v1-1.pdf)

- [PIX - Especificações técnicas e de negócio do ecossistema de pagamentos instantâneos brasileiro](https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/Anexo%20I%20-%20Padr%C3%B5es%20para%20Inicia%C3%A7%C3%A3o%20do%20PIX.pdf)

- [Web3 - Eth Accounts](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html)
  
- [Web3 - Eth Send Transaction](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#sendtransaction)

- [Yellow Paper](http://gavwood.com/paper.pdf)

- [Payment Card Industry (PCI) Data Security Standard](https://listings.pcisecuritystandards.org/documents/pci_dss_emv.pdf)

- [EMV: Get the CVV code from an ICC?](https://stackoverflow.com/questions/17413490/emv-get-the-cvv-code-from-an-icc)