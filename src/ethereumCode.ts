import { Merchant } from "./emv"
import { TransactionConfig } from "web3-core"
import { toChecksumAddress } from "web3-utils"
import { EMVParser } from "src"
import { ETHEREUM_TRANSACTION, ID } from "./emv/types"
import { removeEmpty } from "./utils"

export interface IEthereumCodeParams {
    transactionConfig: TransactionConfig,
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

export default class EthereumCode {

    constructor(protected params: IEthereumCodeParams) {
        this.normalize()
    }

    normalize() {
        if (this.params.transactionConfig.from !== undefined) this.params.transactionConfig.from = toChecksumAddress(String(this.params.transactionConfig.from))
        if (this.params.transactionConfig.to !== undefined) this.params.transactionConfig.to = toChecksumAddress(this.params.transactionConfig.to)
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

        ethereumTransactionDataFieldTemplate.setNonce(String(this.params.transactionConfig.nonce))
        ethereumTransactionDataFieldTemplate.setFrom(this.params.transactionConfig.from)
        ethereumTransactionDataFieldTemplate.setTo(this.params.transactionConfig.to)
        ethereumTransactionDataFieldTemplate.setChainId(String(this.params.transactionConfig.chainId))
        ethereumTransactionDataFieldTemplate.setValue(String(this.params.transactionConfig.value))
        ethereumTransactionDataFieldTemplate.setGas(String(this.params.transactionConfig.gas))
        ethereumTransactionDataFieldTemplate.setGasPrice(String(this.params.transactionConfig.gasPrice))
        ethereumTransactionDataFieldTemplate.setData(this.params.transactionConfig.data)

        emvqr.setEthereumTransactionDataFieldTemplate(ethereumTransactionDataFieldTemplate);

        return emvqr.generatePayload()
    }

    static parse(code: string): IEthereumCodeParams {
        const obj = EMVParser.parse(code)
        const ethTransaction = obj[ID.IDEthereumTransaction]
        const merchantAccountInformation = obj[EEthereumCodeConstants.ID_MERCHANT_ACCOUNT_INFORMATION]
        return removeEmpty({
            transactionConfig: {
                nonce: Number(ethTransaction[ETHEREUM_TRANSACTION.NONCE]),
                from: ethTransaction[ETHEREUM_TRANSACTION.FROM],
                to: ethTransaction[ETHEREUM_TRANSACTION.TO],
                chainId: Number(ethTransaction[ETHEREUM_TRANSACTION.CHAIN_ID]),
                value: ethTransaction[ETHEREUM_TRANSACTION.VALUE],
                gas: ethTransaction[ETHEREUM_TRANSACTION.GAS],
                gasPrice: ethTransaction[ETHEREUM_TRANSACTION.GAS_PRICE],
                data: ethTransaction[ETHEREUM_TRANSACTION.DATA]
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