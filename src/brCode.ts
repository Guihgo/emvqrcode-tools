import { Merchant } from "./emv"


export interface IStaticBRCodeParams {
    pixKey: string,
    additionalInfo?: string,
    merchantName: string,
    merchantCity: string,
    postalCode?: string,
    transactionAmount?: string,
    referenceLabel?: string
}

export default class BrCode {

    GUI = "BR.GOV.BCB.PIX"
    PAYLOAD_FORMAT_INDICATOR = "01" //payload version QRCPS-MPM, fixed at “01”
    COUNTRY_CODE = "BR" //Brazil - Country Code  ISO3166-1 alpha 2
    MERCHANT_CATEGORY_CODE = "0000" //“0000” or MCC ISO18245
    TRANSACTION_CURRENCY = "986" // Real Brasileiro ISO4217

    constructor(protected params: IStaticBRCodeParams) {
        this.validate()
    }

    validate() {
        /* https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/Anexo%20I%20-%20Padr%C3%B5es%20para%20Inicia%C3%A7%C3%A3o%20do%20PIX.pdf pg 15 - 1.2.2 
            -> max: 99
            -> ID + GUID length + Key = 8
            -> GUI length ("BR.GOV.BCB.PIX") = 14
            -> key_length ("em@il.com") = 9
            -> additionalInfo max length = max - 8 - 14 - key_length = 68
        */

        if (this.params.additionalInfo) {
            const maxAdditionalInfoLength = (99 - 8 - this.GUI.length - this.params.pixKey.length)
            if (this.params.additionalInfo.length > maxAdditionalInfoLength) throw new Error(`Only ${maxAdditionalInfoLength} characters can be used using key ${this.params.pixKey} (length: ${this.params.pixKey.length})`)
        } else {
            const maxPixKeyLength = (99 - 8 - this.GUI.length)
            if (this.params.pixKey.length > maxPixKeyLength) throw new Error(`Max length for 'Pix Key' is ${maxPixKeyLength}`)
        }

        if (this.params.merchantName.length > 25) throw new Error("Max length for 'Merchant Name' is 25")

        if (this.params.merchantCity.length > 15) throw new Error("Max length for 'Merchant City' is 15")

        if (this.params.postalCode && this.params.postalCode.length > 99) throw new Error("Max length for 'Postal Code' is 99")
        
        if (this.params.transactionAmount && this.params.transactionAmount.length > 13) throw new Error("Max length for 'Transaction Amount' is 13 ($ 1 000 000 000 ,00 )")

        if (this.params.referenceLabel) {
            if (this.params.referenceLabel.length > 25) throw new Error("Max length for 'Referrence  Code' is 25")
            if (this.params.referenceLabel.indexOf(" ") >= 0) throw new Error("'Referrence  Code' include space ' '")
        }

    }

    get() {
        var emvqr = Merchant.buildEMVQR();

        emvqr.setPayloadFormatIndicator(this.PAYLOAD_FORMAT_INDICATOR);
        emvqr.setCountryCode(this.COUNTRY_CODE)
        emvqr.setMerchantCategoryCode(this.MERCHANT_CATEGORY_CODE);
        emvqr.setTransactionCurrency(this.TRANSACTION_CURRENCY);

        const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
        merchantAccountInformation.setGloballyUniqueIdentifier(this.GUI);

        merchantAccountInformation.addPaymentNetworkSpecific("01", this.params.pixKey);

        if (this.params.additionalInfo) merchantAccountInformation.addPaymentNetworkSpecific("02", this.params.additionalInfo);

        emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

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
}