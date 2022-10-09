import { Merchant } from "./emv"
import { TransactionConfig } from "web3-core"
import { toChecksumAddress } from "web3-utils"
import ABIDecoder from "abi-decoder-typescript"
import { EMVParser } from "./index"
import { ETHEREUM_TRANSACTION, ID } from "./emv/types"
import { removeEmpty } from "./utils"

export interface IEthereumCodeParams {
    transaction: TransactionConfig & {
        data?: TransactionConfig["data"] | any
    },
    provider?: {
        host: string,
    }
    additionalInfo?: string,
    merchantName?: string,
    merchantCity?: string,
    postalCode?: string,
}

export enum EEthereumCodeConstants {
    GUI = "ETHEREUM.BLOCKCHAIN.PIX",
    PAYLOAD_FORMAT_INDICATOR = "01", //payload version QRCPS-MPM, fixed at “01”
    ID_HOST = "01",
    ID_ADDITIONAL_INFO = "02",
    ID_MERCHANT_ACCOUNT_INFORMATION = "26"
}  

export class EthereumCode {

    constructor(protected params: IEthereumCodeParams) {
        this.normalize()
    }

    normalize() {
        if (this.params.transaction.from !== undefined) this.params.transaction.from = toChecksumAddress(String(this.params.transaction.from))
        if (this.params.transaction.to !== undefined) this.params.transaction.to = toChecksumAddress(this.params.transaction.to)
    }

    get() {
        var emvqr = Merchant.buildEMVQR();

        emvqr.setPayloadFormatIndicator(EEthereumCodeConstants.PAYLOAD_FORMAT_INDICATOR);

        const merchantAccountInformation = Merchant.buildMerchantAccountInformation();

        merchantAccountInformation.setGloballyUniqueIdentifier(EEthereumCodeConstants.GUI);
        if (this.params.provider && this.params.provider.host) merchantAccountInformation.addPaymentNetworkSpecific(EEthereumCodeConstants.ID_HOST, this.params.provider.host);
        if (this.params.additionalInfo) merchantAccountInformation.addPaymentNetworkSpecific(EEthereumCodeConstants.ID_ADDITIONAL_INFO, this.params.additionalInfo);

        emvqr.addMerchantAccountInformation(EEthereumCodeConstants.ID_MERCHANT_ACCOUNT_INFORMATION, merchantAccountInformation);

        if (this.params.merchantName) emvqr.setMerchantName(this.params.merchantName);
        if (this.params.merchantCity) emvqr.setMerchantCity(this.params.merchantCity);
        if (this.params.postalCode) emvqr.setPostalCode(this.params.postalCode)

        const ethereumTransactionDataFieldTemplate = Merchant.buildEthereumTransactionDataFieldTemplate();

        ethereumTransactionDataFieldTemplate.setNonce(String(this.params.transaction.nonce))
        ethereumTransactionDataFieldTemplate.setFrom(this.params.transaction.from)
        ethereumTransactionDataFieldTemplate.setTo(this.params.transaction.to)
        ethereumTransactionDataFieldTemplate.setChainId(String(this.params.transaction.chainId))
        ethereumTransactionDataFieldTemplate.setValue(String(this.params.transaction.value))
        ethereumTransactionDataFieldTemplate.setGas(String(this.params.transaction.gas))
        ethereumTransactionDataFieldTemplate.setGasPrice(String(this.params.transaction.gasPrice))
        ethereumTransactionDataFieldTemplate.setData(this.params.transaction.data)

        emvqr.setEthereumTransactionDataFieldTemplate(ethereumTransactionDataFieldTemplate);

        return emvqr.generatePayload()
    }

    static parse(code: string, decodeABI: any = null): IEthereumCodeParams {
        const obj = EMVParser.parse(code)
        const ethTransaction = obj[ID.IDEthereumTransaction]
        const merchantAccountInformation = obj[EEthereumCodeConstants.ID_MERCHANT_ACCOUNT_INFORMATION]

        let data = ethTransaction[ETHEREUM_TRANSACTION.DATA]
        if (decodeABI!==null) {
            const abiDecoder = new ABIDecoder()
            abiDecoder.addABI(decodeABI)
            data = abiDecoder.decodeMethod(data)
        }

        return removeEmpty<IEthereumCodeParams>({
            transaction: {
                nonce: Number(ethTransaction[ETHEREUM_TRANSACTION.NONCE]),
                from: ethTransaction[ETHEREUM_TRANSACTION.FROM],
                to: ethTransaction[ETHEREUM_TRANSACTION.TO],
                chainId: Number(ethTransaction[ETHEREUM_TRANSACTION.CHAIN_ID]),
                value: ethTransaction[ETHEREUM_TRANSACTION.VALUE],
                gas: ethTransaction[ETHEREUM_TRANSACTION.GAS],
                gasPrice: ethTransaction[ETHEREUM_TRANSACTION.GAS_PRICE],
                data,
            },
            provider: {
                host: merchantAccountInformation[EEthereumCodeConstants.ID_HOST]
            },
            additionalInfo: merchantAccountInformation[EEthereumCodeConstants.ID_ADDITIONAL_INFO],
            merchantName: obj[ID.IDMerchantName],
            merchantCity: obj[ID.IDMerchantCity],
            postalCode: obj[ID.IDPostalCode],
        })
    }

}