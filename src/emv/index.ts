import _Merchant from "./merchant";
// const Consumer = require('./qrcode/consumer');

export const Merchant = {
    /**
     * Builder Objects
     */
    buildTLV: _Merchant.TLV,
    buildAdditionalDataFieldTemplate: _Merchant.AdditionalDataFieldTemplate,
    buildEMVQR: _Merchant.EMVQR,
    buildMerchantInformationLanguageTemplate: _Merchant.MerchantInformationLanguageTemplate,
    buildMerchantAccountInformation: _Merchant.MerchantAccountInformation,
    buildPaymentSystemSpecific: _Merchant.PaymentSystemSpecific,
    buildUnreservedTemplate: _Merchant.UnreservedTemplate,

    /**
     * QRCode Parser
     */
    Parser: _Merchant.Parser,

    /**
     * All available constants
     */
    Constants: _Merchant.Constants,
}

// export default {
//     // Consumer: {
//     //     /**
//     //      * Builder Objects
//     //      */
//     //     buildApplicationTemplate: Consumer.ApplicationTemplate,
//     //     buildApplicationSpecificTransparentTemplate: Consumer.ApplicationSpecificTransparentTemplate,
//     //     buildBERTLV: Consumer.BERTLV,
//     //     buildCommonDataTemplate: Consumer.CommonDataTemplate,
//     //     buildCommonDataTransparentTemplate: Consumer.CommonDataTransparentTemplate,
//     //     buildEMVQR: Consumer.EMVQR,

//     //     /**
//     //      * All available constants
//     //      */
//     //     Constants: Consumer.Constants,
//     // }
// };
