import { EMVParser } from "./index"
import { Merchant } from "./emv"
import { ADDITIONAL_FIELD, ID } from "./emv/types"
import { removeEmpty } from "./utils"


export interface IStaticBRCodeParams {
    pixKey: string,
    additionalInfo?: string,
    merchantName: string,
    merchantCity: string,
    postalCode?: string,
    transactionAmount?: string | number,
    referenceLabel?: string
}

export enum EBrCodeConstants {
    GUI = "BR.GOV.BCB.PIX",
    PAYLOAD_FORMAT_INDICATOR = "01", //payload version QRCPS-MPM, fixed at “01”
    COUNTRY_CODE = "BR", //Brazil - Country Code  ISO3166-1 alpha 2
    MERCHANT_CATEGORY_CODE = "0000", //“0000” or MCC ISO18245
    TRANSACTION_CURRENCY = "986",
    ID_PIX_KEY = "01",
    ID_ADDITIONAL_INFO = "02",
    ID_MERCHANT_ACCOUNT_INFORMATION = "26"
} 

export default class BrCode {

    constructor(protected params: IStaticBRCodeParams) {
        this.normalize()
    }

    normalize() {
        /* https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/Anexo%20I%20-%20Padr%C3%B5es%20para%20Inicia%C3%A7%C3%A3o%20do%20PIX.pdf pg 15 - 1.2.2 
            -> max: 99
            -> ID + GUID length + Key = 8
            -> GUI length ("BR.GOV.BCB.PIX") = 14
            -> key_length ("em@il.com") = 9
            -> additionalInfo max length = max - 8 - 14 - key_length = 68
        */

        if (this.params.additionalInfo) {
            const maxAdditionalInfoLength = (99 - 8 - EBrCodeConstants.GUI.length - this.params.pixKey.length)
            if (this.params.additionalInfo.length > maxAdditionalInfoLength) this.params.additionalInfo = this.params.additionalInfo.slice(0, maxAdditionalInfoLength)
        } else {
            const maxPixKeyLength = (99 - 8 - EBrCodeConstants.GUI.length)
            if (this.params.pixKey.length > maxPixKeyLength) throw new Error(`Max length for 'Pix Key' is ${maxPixKeyLength}`)
        }

        if (this.params.merchantName.length > 25) this.params.merchantName = this.params.merchantName.slice(0,25)
        
        if (this.params.merchantCity.length > 15) this.params.merchantCity = this.params.merchantCity.slice(0, 15)

        if (this.params.postalCode && this.params.postalCode.length > 99) this.params.postalCode = this.params.postalCode.slice(0, 99)
        
        if (typeof this.params.transactionAmount === "string") {
            if (this.params.transactionAmount && this.params.transactionAmount.length > 13) this.params.transactionAmount = this.params.transactionAmount.slice(0, 13)
            this.params.transactionAmount = Number(this.params.transactionAmount.replace(",", ".").trim())
        }
        this.params.transactionAmount = (this.params.transactionAmount as Number).toFixed(2)

        if (this.params.referenceLabel) {
            if (this.params.referenceLabel.length > 25) this.params.referenceLabel = this.params.referenceLabel.slice(0, 25)
            if (this.params.referenceLabel.indexOf(" ") >= 0) this.params.referenceLabel = this.params.referenceLabel.replaceAll(" ", "")
        }

        /* Remove all accents */
        let param: keyof IStaticBRCodeParams
        for (param in this.params) {
            this.params[param] = (this.params[param] as keyof IStaticBRCodeParams).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }
    }

    get() {
        var emvqr = Merchant.buildEMVQR();

        emvqr.setPayloadFormatIndicator(EBrCodeConstants.PAYLOAD_FORMAT_INDICATOR);
        emvqr.setCountryCode(EBrCodeConstants.COUNTRY_CODE)
        emvqr.setMerchantCategoryCode(EBrCodeConstants.MERCHANT_CATEGORY_CODE);
        emvqr.setTransactionCurrency(EBrCodeConstants.TRANSACTION_CURRENCY);

        const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
        merchantAccountInformation.setGloballyUniqueIdentifier(EBrCodeConstants.GUI);

        merchantAccountInformation.addPaymentNetworkSpecific(EBrCodeConstants.ID_PIX_KEY, this.params.pixKey);

        if (this.params.additionalInfo) merchantAccountInformation.addPaymentNetworkSpecific(EBrCodeConstants.ID_ADDITIONAL_INFO, this.params.additionalInfo);

        emvqr.addMerchantAccountInformation(EBrCodeConstants.ID_MERCHANT_ACCOUNT_INFORMATION, merchantAccountInformation);

        emvqr.setMerchantName(this.params.merchantName);

        emvqr.setMerchantCity(this.params.merchantCity);

        if (this.params.transactionAmount) {
            emvqr.setTransactionAmount(this.params.transactionAmount);
        }

        if (this.params.postalCode) emvqr.setPostalCode(this.params.postalCode)

        const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

        if (this.params.referenceLabel) {
            additionalDataFieldTemplate.setReferenceLabel(this.params.referenceLabel);
        }
        else {
            additionalDataFieldTemplate.setReferenceLabel("***");
        }

        emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);

        return emvqr.generatePayload();
    }

    static parse(code: string): IStaticBRCodeParams{
        const obj = EMVParser.parse(code)
        const merchantAccountInformation = obj[EBrCodeConstants.ID_MERCHANT_ACCOUNT_INFORMATION]
        return removeEmpty({
            pixKey: merchantAccountInformation[EBrCodeConstants.ID_PIX_KEY],
            additionalInfo: merchantAccountInformation[EBrCodeConstants.ID_ADDITIONAL_INFO],
            merchantName: obj[ID.IDMerchantName],
            merchantCity: obj[ID.IDMerchantCity],
            postalCode: obj[ID.IDPostalCode],
            transactionAmount: Number(obj[ID.IDTransactionAmount]),
            referenceLabel: obj[ID.IDAdditionalDataFieldTemplate][ADDITIONAL_FIELD.AdditionalIDReferenceLabel]
        })
    }
}