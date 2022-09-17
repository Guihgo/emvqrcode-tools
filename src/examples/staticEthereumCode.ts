import { EthereumCode } from ".."
import Web3 from "web3"
import { toChecksumAddress, toWei } from "web3-utils"

const run = async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s3.binance.org:8545"))
    const defaultGas = "21000"
    const from = toChecksumAddress("0xAB518cD35e0Cc361Fe7687C3CF6b81147AA62d74")
    const to = toChecksumAddress("0xbF78a3e6e33b58a016A30EfC3C56cF8FCDB7e612")
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

