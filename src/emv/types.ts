/* eslint-disable no-return-assign */
import {crc16ccitt} from "crc"

const EMPTY_VALUE = '';
const PAD_ZERO = '00';

const ID = {
    IDPayloadFormatIndicator: '00', // (M) Payload Format Indicator
    IDPointOfInitiationMethod: '01', // (O) Point of Initiation Method
    IDMerchantAccountInformationRangeStart: '02', // (M) 2-51 Merchant Account Information
    IDMerchantAccountInformationRangeEnd: '51', // (M) 2-51 Merchant Account Information
    IDMerchantCategoryCode: '52', // (M) Merchant Category Code
    IDTransactionCurrency: '53', // (M) Transaction Currency
    IDTransactionAmount: '54', // (C) Transaction Amount
    IDTipOrConvenienceIndicator: '55', // (O) Tip or Convenience Indicator
    IDValueOfConvenienceFeeFixed: '56', // (C) Value of Convenience Fee Fixed
    IDValueOfConvenienceFeePercentage: '57', // (C) Value of Convenience Fee Percentage
    IDCountryCode: '58', // (M) Country Code
    IDMerchantName: '59', // (M) Merchant Name
    IDMerchantCity: '60', // (M) Merchant City
    IDPostalCode: '61', // (O) Postal Code
    IDAdditionalDataFieldTemplate: '62', // (O) Additional Data Field Template
    IDCRC: '63', // (M) CRC
    IDMerchantInformationLanguageTemplate: '64', // (O) Merchant Information— Language Template
    IDRFUForEMVCoRangeStart: '65', // (O) 65-79 RFU for EMVCo
    IDRFUForEMVCoRangeEnd: '79', // (O) 65-79 RFU for EMVCo
    IDUnreservedTemplatesRangeStart: '80', // (O) 80-99 Unreserved Templates
    IDUnreservedTemplatesRangeEnd: '99', // (O) 80-99 Unreserved Templates
};

const ADDITIONAL_FIELD = {
    AdditionalIDBillNumber: '01', // (O) Bill Number
    AdditionalIDMobileNumber: '02', // (O) Mobile Number
    AdditionalIDStoreLabel: '03', // (O) Store Label
    AdditionalIDLoyaltyNumber: '04', // (O) Loyalty Number
    AdditionalIDReferenceLabel: '05', // (O) Reference Label
    AdditionalIDCustomerLabel: '06', // (O) Customer Label
    AdditionalIDTerminalLabel: '07', // (O) Terminal Label
    AdditionalIDPurposeTransaction: '08', // (O) Purpose Transaction
    AdditionalIDAdditionalConsumerDataRequest: '09', // (O) Additional Consumer Data Request
    AdditionalIDRFUforEMVCoRangeStart: '10', // (O) RFU for EMVCo
    AdditionalIDRFUforEMVCoRangeEnd: '49', // (O) RFU for EMVCo
    AdditionalIDPaymentSystemSpecificTemplatesRangeStart: '50', // (O) Payment System Specific Templates
    AdditionalIDPaymentSystemSpecificTemplatesRangeEnd: '99', // (O) Payment System Specific Templates
};

const MERCHANT_ACCOUNT_INFORMATION = {
    MerchantAccountInformationIDGloballyUniqueIdentifier: '00',
    MerchantAccountInformationIDPaymentNetworkSpecificStart: '01', // (O) 03-99 RFU for EMVCo
    MerchantAccountInformationIDPaymentNetworkSpecificEnd: '99', // (O) 03-99 RFU for EMVCo
};

const MERCHANT_INFORMATION = {
    MerchantInformationIDLanguagePreference: '00', // (M) Language Preference
    MerchantInformationIDMerchantName: '01', // (M) Merchant Name
    MerchantInformationIDMerchantCity: '02', // (O) Merchant City
    MerchantInformationIDRFUforEMVCoRangeStart: '03', // (O) 03-99 RFU for EMVCo
    MerchantInformationIDRFUforEMVCoRangeEnd: '99', // (O) 03-99 RFU for EMVCo
};

const UNRESERVED_TEMPLATE = {
    UnreservedTemplateIDGloballyUniqueIdentifier: '00',
    UnreservedTemplateIDContextSpecificDataStart: '01', // (O) 03-99 RFU for EMVCo
    UnreservedTemplateIDContextSpecificDataEnd: '99', // (O) 03-99 RFU for EMVCo
};

const INITIAL_METHOD = {
    PointOfInitiationMethodStatic: '11',
    PointOfInitiationMethodDynamic: '12',
};

const DATA_TYPE = {
    BINARY: 'binary',
    RAW: 'raw',
};

export const Constants = {
    ADDITIONAL_FIELD,
    DATA_TYPE,
    ID,
    MERCHANT_ACCOUNT_INFORMATION,
    MERCHANT_INFORMATION,
    UNRESERVED_TEMPLATE,
}

export const TLV = (tag: string, length: string, value: string) : any => {
    if (typeof length === 'number') {
        length = pad2(length);
    }

    const toString = () => {
        if (value && value !== '') {
            return tag + length + value;
        }
        return '';
    };

    const dataWithType = (dataType: string, indent: any) => {
        if (value && value !== '') {
            if (dataType === DATA_TYPE.BINARY) {
                const REGEX_PATTERN = /(.{2})/g;
                const hexStr = Buffer.from(value).toString('hex').toUpperCase();
                let hexArray = hexStr.match(REGEX_PATTERN);

                hexArray = hexArray || [];
                return indent + tag.toString() + ' ' + length + ' ' + hexArray.join(' ') + '\n';
            }
            else if (dataType === DATA_TYPE.RAW) {
                return indent + tag + ' ' + length + ' ' + value + '\n';
            }
        }
        return '';
    };

    return {
        dataWithType,
        toString,
    };
};

export const UnreservedTemplateTLV = (tag: string, length: string, value: { dataWithType: (arg0: any, arg1: any) => string; toString: () => any; }) => {
    const dataWithType = (dataType: any, indent: any) => {
        if (tag && length && value) {
            return tag + ' ' + length + '\n' + value.dataWithType(dataType, indent);
        }
        return '';
    };

    const toString = () => {
        if (tag && length && value) {
            return tag + length + value.toString();
        }
        return '';
    };

    return {
        dataWithType,
        toString
    };
};

export const UnreservedTemplate = (globallyUniqueIdentifier?: any, contextSpecificData : Array<any> = []) => {
    const toString = () => {
        if (globallyUniqueIdentifier && contextSpecificData) {
            let t = '';
            t += globallyUniqueIdentifier.toString();
            t += contextSpecificData.reduce((accumulator, c) => accumulator += c.toString(), '');
            return t;
        }
        return '';
    };

    const dataWithType = (dataType: any, indent: any) => {
        if (globallyUniqueIdentifier && contextSpecificData) {
            const csData = contextSpecificData.reduce((accumulator, cs) => accumulator += cs.dataWithType(dataType, indent), '');
            return globallyUniqueIdentifier.dataWithType(dataType, indent) + csData;
        }
        return '';
    };

    const setGloballyUniqueIdentifier = (v: any) => {
        globallyUniqueIdentifier = TLV(UNRESERVED_TEMPLATE.UnreservedTemplateIDGloballyUniqueIdentifier, l(v), v);
    };

    const addContextSpecificData = (id: any, v: any) => {
        contextSpecificData.push(TLV(id, l(v), v));
    };

    return {
        dataWithType,
        toString,
        setGloballyUniqueIdentifier,
        addContextSpecificData
    };
};

export const PaymentSystemSpecificTLV = (tag: string, length: string, value: any) => {
    const dataWithType = (dataType: any, indent: any) => {
        if (tag && length && value) {
            return tag + ' ' + length + '\n' + value.dataWithType(dataType, indent);
        }
        return '';
    };

    const toString = () => {
        if (tag && length && value) {
            return tag + length + value.toString();
        }
        return '';
    };

    return {
        dataWithType,
        toString
    };
};

export const PaymentSystemSpecific = (globallyUniqueIdentifier: any, paymentSystemSpecific : Array<any> = []) => {
    const toString = () => {
        if (globallyUniqueIdentifier && paymentSystemSpecific) {
            let t = '';
            t += globallyUniqueIdentifier.toString();
            t += paymentSystemSpecific.reduce((accumulator, p) => accumulator += p.toString(), '');
            return t;
        }
        return '';
    };

    const dataWithType = (dataType: any, indent: any) => {
        if (globallyUniqueIdentifier && paymentSystemSpecific) {
            const pnsData = paymentSystemSpecific.reduce((accumulator, pns) => accumulator += pns.dataWithType(dataType, indent), '');
            return globallyUniqueIdentifier.dataWithType(dataType, indent) + pnsData;
        }
        return '';
    };

    const setGloballyUniqueIdentifier = (v: any) => {
        globallyUniqueIdentifier = TLV(MERCHANT_ACCOUNT_INFORMATION.MerchantAccountInformationIDGloballyUniqueIdentifier, l(v), v);
    };

    const addPaymentSystemSpecific = (id: any, v: any) => {
        paymentSystemSpecific.push(TLV(id, l(v), v));
    };

    return {
        dataWithType,
        toString,
        setGloballyUniqueIdentifier,
        addPaymentSystemSpecific,
    };
};

export const MerchantAccountInformationTLV = (tag: string, length: string, value: any) => {
    const dataWithType = (dataType: any, indent: any) => {
        if (tag && length && value) {
            return tag + ' ' + length + '\n' + value.dataWithType(dataType, indent);
        }
        return '';
    };

    const toString = () => {
        if (tag && length && value) {
            return tag + length + value.toString();
        }
        return '';
    };

    return {
        dataWithType,
        toString
    };
};

export const MerchantAccountInformation = (globallyUniqueIdentifier?: any, paymentNetworkSpecific : Array<any> = []) => {
    const toString = () => {
        if (globallyUniqueIdentifier && paymentNetworkSpecific) {
            let t = '';
            t += globallyUniqueIdentifier.toString();
            t += paymentNetworkSpecific.reduce((accumulator, p) => accumulator += p.toString(), '');
            return t;
        }
        return '';
    };

    const dataWithType = (dataType: any, indent: any) => {
        if (globallyUniqueIdentifier && paymentNetworkSpecific) {
            const pnsData = paymentNetworkSpecific.reduce((accumulator, pns) => accumulator += pns.dataWithType(dataType, indent), '');
            return globallyUniqueIdentifier.dataWithType(dataType, indent) + pnsData;
        }
        return '';
    };

    const setGloballyUniqueIdentifier = (v: any) => {
        globallyUniqueIdentifier = TLV(MERCHANT_ACCOUNT_INFORMATION.MerchantAccountInformationIDGloballyUniqueIdentifier, l(v), v);
    };

    const addPaymentNetworkSpecific = (id: any, v: any) => {
        paymentNetworkSpecific.push(TLV(id, l(v), v));
    };

    return {
        dataWithType,
        toString,
        setGloballyUniqueIdentifier,
        addPaymentNetworkSpecific,
    };
};

export const MerchantInformationLanguageTemplate = (
    languagePreference = TLV(MERCHANT_INFORMATION.MerchantInformationIDLanguagePreference, l(EMPTY_VALUE), EMPTY_VALUE),
    merchantName = TLV(MERCHANT_INFORMATION.MerchantInformationIDMerchantName, l(EMPTY_VALUE), EMPTY_VALUE),
    merchantCity = TLV(MERCHANT_INFORMATION.MerchantInformationIDMerchantCity, l(EMPTY_VALUE), EMPTY_VALUE),
    rfuForEMVCo : Array<any> = []
) => {
    const dataWithType = (dataType: any, indent: any) => {
        let str = '';
        str += languagePreference.dataWithType(dataType, indent);
        str += merchantName.dataWithType(dataType, indent);
        str += merchantCity.dataWithType(dataType, indent);
        str += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.dataWithType(dataType, indent), '');
        if (str && str !== '') {
            return ID.IDMerchantInformationLanguageTemplate + ' ' + ll(toString()) + '\n' + str;
        }
        return '';
    };

    const toString = () => {
        let str = '';
        str += languagePreference.toString();
        str += merchantName.toString();
        str += merchantCity.toString();
        str += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.toString(), '');
        if (str && str !== '') {
            return format(ID.IDMerchantInformationLanguageTemplate, str);
        }
        return '';
    };

    const validate = () => {
        if (!languagePreference || languagePreference.toString() === '') {
            throw new Error('languagePreference is mandatory');
        }
        if (!merchantName || merchantName.toString() === '') {
            throw new Error('merchantName is mandatory');
        }
        return true;
    };

    const setLanguagePreference = (v: any) => {
        languagePreference = TLV(MERCHANT_INFORMATION.MerchantInformationIDLanguagePreference, l(v), v);
    };

    const setMerchantName = (v: any) => {
        merchantName = TLV(MERCHANT_INFORMATION.MerchantInformationIDMerchantName, l(v), v);
    };

    const setMerchantCity = (v: any) => {
        merchantCity = TLV(MERCHANT_INFORMATION.MerchantInformationIDMerchantCity, l(v), v);
    };

    const addRFUforEMVCo = (id: any, v: any) => {
        rfuForEMVCo.push(TLV(id, l(v), v));
    };

    return {
        dataWithType,
        toString,
        validate,
        setLanguagePreference,
        setMerchantName,
        setMerchantCity,
        addRFUforEMVCo,
    };
};

export const AdditionalDataFieldTemplate = (
    billNumber = TLV(ADDITIONAL_FIELD.AdditionalIDBillNumber, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Bill Number"`
    mobileNumber = TLV(ADDITIONAL_FIELD.AdditionalIDMobileNumber, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Country Code"`
    storeLabel = TLV(ADDITIONAL_FIELD.AdditionalIDStoreLabel, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Store Label"`
    loyaltyNumber = TLV(ADDITIONAL_FIELD.AdditionalIDLoyaltyNumber, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Loyalty Number"`
    referenceLabel = TLV(ADDITIONAL_FIELD.AdditionalIDReferenceLabel, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Reference Label"`
    customerLabel = TLV(ADDITIONAL_FIELD.AdditionalIDCustomerLabel, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Customer Label"`
    terminalLabel = TLV(ADDITIONAL_FIELD.AdditionalIDTerminalLabel, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Terminal Label"`
    purposeTransaction = TLV(ADDITIONAL_FIELD.AdditionalIDPurposeTransaction, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Purpose of Transaction"`
    additionalConsumerDataRequest = TLV(ADDITIONAL_FIELD.AdditionalIDAdditionalConsumerDataRequest, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Additional Consumer Data Request"`
    rfuForEMVCo : Array<any> = [], // `json:"RFU for EMVCo"`
    paymentSystemSpecific : any = {}, // `json:"Payment System specific templates"`
) => {
    const dataWithType = (dataType: any, indent: any) => {
        let t = '';
        t += billNumber.dataWithType(dataType, indent);
        t += mobileNumber.dataWithType(dataType, indent);
        t += storeLabel.dataWithType(dataType, indent);
        t += loyaltyNumber.dataWithType(dataType, indent);
        t += referenceLabel.dataWithType(dataType, indent);
        t += customerLabel.dataWithType(dataType, indent);
        t += terminalLabel.dataWithType(dataType, indent);
        t += purposeTransaction.dataWithType(dataType, indent);
        t += additionalConsumerDataRequest.dataWithType(dataType, indent);
        t += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.dataWithType(dataType, indent), '');
        Object.keys(paymentSystemSpecific).forEach(function (key) {
            t += indent + paymentSystemSpecific[key].dataWithType(dataType, '  ');
        });
        if (t && t !== '') {
            return ID.IDAdditionalDataFieldTemplate + ' ' + ll(toString()) + '\n' + t;
        }
        return '';
    };

    const toString = () => {
        let str = '';
        str += billNumber.toString();
        str += mobileNumber.toString();
        str += storeLabel.toString();
        str += loyaltyNumber.toString();
        str += referenceLabel.toString();
        str += customerLabel.toString();
        str += terminalLabel.toString();
        str += purposeTransaction.toString();
        str += additionalConsumerDataRequest.toString();
        str += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.toString(), '');
        Object.keys(paymentSystemSpecific).forEach(function (key) {
            str += paymentSystemSpecific[key].toString();
        });
        if (str && str !== '') {
            return format(ID.IDAdditionalDataFieldTemplate, str);
        }
        return '';
    };

    const setBillNumber = (v: any) => {
        billNumber = TLV(ADDITIONAL_FIELD.AdditionalIDBillNumber, l(v), v);
    };

    const setMobileNumber = (v: any) => {
        mobileNumber = TLV(ADDITIONAL_FIELD.AdditionalIDMobileNumber, l(v), v);
    };

    const setStoreLabel = (v: any) => {
        storeLabel = TLV(ADDITIONAL_FIELD.AdditionalIDStoreLabel, l(v), v);
    };
    const setLoyaltyNumber = (v: any) => {
        loyaltyNumber = TLV(ADDITIONAL_FIELD.AdditionalIDLoyaltyNumber, l(v), v);
    };
    const setReferenceLabel = (v: any) => {
        referenceLabel = TLV(ADDITIONAL_FIELD.AdditionalIDReferenceLabel, l(v), v);
    };
    const setCustomerLabel = (v: any) => {
        customerLabel = TLV(ADDITIONAL_FIELD.AdditionalIDCustomerLabel, l(v), v);
    };
    const setTerminalLabel = (v: any) => {
        terminalLabel = TLV(ADDITIONAL_FIELD.AdditionalIDTerminalLabel, l(v), v);
    };
    const setPurposeTransaction = (v: any) => {
        purposeTransaction = TLV(ADDITIONAL_FIELD.AdditionalIDPurposeTransaction, l(v), v);
    };
    const setAdditionalConsumerDataRequest = (v: any) => {
        additionalConsumerDataRequest = TLV(ADDITIONAL_FIELD.AdditionalIDAdditionalConsumerDataRequest, l(v), v);
    };

    const addRFUforEMVCo = (id: any, v: any) => {
        rfuForEMVCo.push(TLV(id, l(v), v));
    };

    const addPaymentSystemSpecific = (id: string, v: { toString: () => any; }) => {
        if (!paymentSystemSpecific) {
            paymentSystemSpecific = {};
        }
        paymentSystemSpecific[id] = PaymentSystemSpecificTLV(id, l(v.toString()), v);
    };

    return {
        dataWithType,
        toString,
        setBillNumber,
        setMobileNumber,
        setStoreLabel,
        setLoyaltyNumber,
        setReferenceLabel,
        setCustomerLabel,
        setTerminalLabel,
        setPurposeTransaction,
        setAdditionalConsumerDataRequest,
        addRFUforEMVCo,
        addPaymentSystemSpecific,
    };
};

export interface IEMVQR {
    dataWithType: (dataType: string)=>string,
    toBinary: ()=>string,
    rawData: ()=>string,
    generatePayload: ()=>string,
    validate: ()=>boolean,
    setPayloadFormatIndicator : (v: any) => void,
    setPointOfInitiationMethod : (v: any) => void,
    setMerchantCategoryCode : (v: any) => void,
    setTransactionCurrency : (v: any) => void,
    setTransactionAmount : (v: any) => void,
    setTipOrConvenienceIndicator : (v: any) => void,
    setValueOfConvenienceFeeFixed : (v: any) => void,
    setValueOfConvenienceFeePercentage : (v: any) => void,
    setCountryCode : (v: any) => void,
    setMerchantName : (v: any) => void,
    setMerchantCity : (v: any) => void,
    setPostalCode : (v: any) => void,
    setCRC : (v: any) => void,
    setAdditionalDataFieldTemplate : (v: any) => void,
    setMerchantInformationLanguageTemplate : (v: any) => void,
    addMerchantAccountInformation : (id: string, v: any) => void,
    addUnreservedTemplates : (id: string, v: any) => void,
    addRFUforEMVCo: (id: any, v: any) => void
}

export const EMVQR = (
    payloadFormatIndicator = TLV(ID.IDPayloadFormatIndicator, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Payload Format Indicator"`
    pointOfInitiationMethod = TLV(ID.IDPointOfInitiationMethod, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Point of Initiation Method"`
    merchantAccountInformation : any = {}, // `json:"Merchant Account Information"`
    merchantCategoryCode = TLV(ID.IDMerchantCategoryCode, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Merchant Category Code"`
    transactionCurrency = TLV(ID.IDTransactionCurrency, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Transaction Currency"`
    transactionAmount = TLV(ID.IDTransactionAmount, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Transaction Amount"`
    tipOrConvenienceIndicator = TLV(ID.IDTipOrConvenienceIndicator, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Tip or Convenience Indicator"`
    valueOfConvenienceFeeFixed = TLV(ID.IDValueOfConvenienceFeeFixed, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Value of Convenience Fee Fixed"`
    valueOfConvenienceFeePercentage = TLV(ID.IDValueOfConvenienceFeePercentage, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Value of Convenience Fee Percentage"`
    countryCode = TLV(ID.IDCountryCode, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Country Code"`
    merchantName = TLV(ID.IDMerchantName, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Merchant Name"`
    merchantCity = TLV(ID.IDMerchantCity, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Merchant City"`
    postalCode = TLV(ID.IDPostalCode, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"Postal Code"`
    additionalDataFieldTemplate = AdditionalDataFieldTemplate(), // `json:"Additional Data Field Template"`
    crc = TLV(ID.IDCRC, l(EMPTY_VALUE), EMPTY_VALUE), // `json:"CRC"`
    merchantInformationLanguageTemplate = MerchantInformationLanguageTemplate(), // `json:"Merchant Information - Language Template"`
    rfuForEMVCo : Array<any> = [], // `json:"RFU for EMVCo"`
    unreservedTemplates : any = {}, // `json:"Unreserved Templates"`
) : IEMVQR => {
    const dataWithType = (dataType: string) => {
        const indent = '';
        let str = '';
        str += payloadFormatIndicator.dataWithType(dataType, indent);
        str += pointOfInitiationMethod.dataWithType(dataType, indent);
        Object.keys(merchantAccountInformation).forEach(function (key) {
            str += merchantAccountInformation[key].dataWithType(dataType, ' ');
        });
        str += merchantCategoryCode.dataWithType(dataType, indent);
        str += transactionCurrency.dataWithType(dataType, indent);
        str += transactionAmount.dataWithType(dataType, indent);
        str += tipOrConvenienceIndicator.dataWithType(dataType, indent);
        str += valueOfConvenienceFeeFixed.dataWithType(dataType, indent);
        str += valueOfConvenienceFeePercentage.dataWithType(dataType, indent);
        str += countryCode.dataWithType(dataType, indent);
        str += merchantName.dataWithType(dataType, indent);
        str += merchantCity.dataWithType(dataType, indent);
        str += postalCode.dataWithType(dataType, indent);
        str += additionalDataFieldTemplate.dataWithType(dataType, ' ');
        str += merchantInformationLanguageTemplate.dataWithType(dataType, ' ');
        str += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.dataWithType(dataType, indent), '');
        Object.keys(unreservedTemplates).forEach(function (key) {
            str += unreservedTemplates[key].dataWithType(dataType, ' ');
        });
        str += crc.dataWithType(dataType, indent);
        return str;
    };

    const toBinary = () => {
        return dataWithType(DATA_TYPE.BINARY);
    };

    const rawData = () => {
        return dataWithType(DATA_TYPE.RAW);
    };

    const generatePayload = () => {
        let str = '';
        str += payloadFormatIndicator ? payloadFormatIndicator.toString() : '';
        str += pointOfInitiationMethod.toString();
        Object.keys(merchantAccountInformation).forEach(function (key) {
            str += merchantAccountInformation[key].toString();
        });
        str += merchantCategoryCode.toString();
        str += transactionCurrency.toString();
        str += transactionAmount.toString();
        str += tipOrConvenienceIndicator.toString();
        str += valueOfConvenienceFeeFixed.toString();
        str += valueOfConvenienceFeePercentage.toString();
        str += countryCode.toString();
        str += merchantName.toString();
        str += merchantCity.toString();
        str += postalCode.toString();
        str += additionalDataFieldTemplate.toString();
        str += merchantInformationLanguageTemplate.toString();
        str += rfuForEMVCo.reduce((accumulator, r) => accumulator += r.toString(), '');
        Object.keys(unreservedTemplates).forEach(function (key) {
            str += unreservedTemplates[key].toString();
        });
        str += formatCrc(str);
        return str;
    };

    const validate = () => {
        if (!payloadFormatIndicator || payloadFormatIndicator.toString() === '') {
            throw new Error('payloadFormatIndicator is mandatory');
        }
        if (!merchantAccountInformation || Object.keys(merchantAccountInformation).length <= 0) {
            throw new Error('merchantAccountInformation is mandatory');
        }
        if (!merchantCategoryCode || merchantCategoryCode.toString() === '') {
            throw new Error('merchantCategoryCode is mandatory');
        }
        if (!transactionCurrency || transactionCurrency.toString() === '') {
            throw new Error('transactionCurrency is mandatory');
        }
        if (!countryCode || countryCode.toString() === '') {
            throw new Error('countryCode is mandatory');
        }
        if (!merchantName || merchantName.toString() === '') {
            throw new Error('merchantName is mandatory');
        }
        if (!merchantCity || merchantCity.toString() === '') {
            throw new Error('merchantCity is mandatory');
        }

        if (pointOfInitiationMethod && pointOfInitiationMethod.value && pointOfInitiationMethod.value !== '') {
            // eslint-disable-next-line eqeqeq
            if (pointOfInitiationMethod.value != INITIAL_METHOD.PointOfInitiationMethodStatic && pointOfInitiationMethod.value != INITIAL_METHOD.PointOfInitiationMethodDynamic) {
                throw new Error(`PointOfInitiationMethod should be "11" or "12", PointOfInitiationMethod: ${pointOfInitiationMethod.toString()}`);
            }
        }
        if (merchantInformationLanguageTemplate) {
            merchantInformationLanguageTemplate.validate();
        }
        return true;
    };

    const setPayloadFormatIndicator = (v: any) => {
        payloadFormatIndicator = TLV(ID.IDPayloadFormatIndicator, l(v), v);
    };

    const setPointOfInitiationMethod = (v: any) => {
        pointOfInitiationMethod = TLV(ID.IDPointOfInitiationMethod, l(v), v);
    };

    const setMerchantCategoryCode = (v: any) => {
        merchantCategoryCode = TLV(ID.IDMerchantCategoryCode, l(v), v);
    };

    const setTransactionCurrency = (v: any) => {
        transactionCurrency = TLV(ID.IDTransactionCurrency, l(v), v);
    };

    const setTransactionAmount = (v: any) => {
        transactionAmount = TLV(ID.IDTransactionAmount, l(v), v);
    };

    const setTipOrConvenienceIndicator = (v: any) => {
        tipOrConvenienceIndicator = TLV(ID.IDTipOrConvenienceIndicator, l(v), v);
    };

    const setValueOfConvenienceFeeFixed = (v: any) => {
        valueOfConvenienceFeeFixed = TLV(ID.IDValueOfConvenienceFeeFixed, l(v), v);
    };

    const setValueOfConvenienceFeePercentage = (v: any) => {
        valueOfConvenienceFeePercentage = TLV(ID.IDValueOfConvenienceFeePercentage, l(v), v);
    };

    const setCountryCode = (v: any) => {
        countryCode = TLV(ID.IDCountryCode, l(v), v);
    };

    const setMerchantName = (v: any) => {
        merchantName = TLV(ID.IDMerchantName, l(v), v);
    };

    const setMerchantCity = (v: any) => {
        merchantCity = TLV(ID.IDMerchantCity, l(v), v);
    };

    const setPostalCode = (v: any) => {
        postalCode = TLV(ID.IDPostalCode, l(v), v);
    };

    const setCRC = (v: any) => {
        crc = TLV(ID.IDCRC, l(v), v);
    };

    const setAdditionalDataFieldTemplate = (v: any) => {
        additionalDataFieldTemplate = v;
    };

    const setMerchantInformationLanguageTemplate = (v: any) => {
        merchantInformationLanguageTemplate = v;
    };

    const addMerchantAccountInformation = (id: string, v: any) => {
        if (!merchantAccountInformation) {
            merchantAccountInformation = {};
        }
        merchantAccountInformation[id] = MerchantAccountInformationTLV(id, l(v.toString()), v);
    };

    const addUnreservedTemplates = (id: string, v: any) => {
        if (!unreservedTemplates) {
            unreservedTemplates = {};
        }
        unreservedTemplates[id] = UnreservedTemplateTLV(id, l(v.toString()), v);
    };

    const addRFUforEMVCo = (id: any, v: any) => {
        rfuForEMVCo.push(TLV(id, l(v), v));
    };

    return {
        dataWithType,
        toBinary,
        rawData,
        generatePayload,
        validate,
        setPayloadFormatIndicator,
        setPointOfInitiationMethod,
        setMerchantCategoryCode,
        setTransactionCurrency,
        setTransactionAmount,
        setTipOrConvenienceIndicator,
        setValueOfConvenienceFeeFixed,
        setValueOfConvenienceFeePercentage,
        setCountryCode,
        setMerchantName,
        setMerchantCity,
        setPostalCode,
        setCRC,
        setAdditionalDataFieldTemplate,
        setMerchantInformationLanguageTemplate,
        addMerchantAccountInformation,
        addUnreservedTemplates,
        addRFUforEMVCo,
    };
};

const format = (id: string, value: string | any[]) => {
    const valueLength = value.length;
    return id + pad2(valueLength) + value;
};

const formatCrc = (value: string) => {
    if (value && value !== '') {
        const newValue = value + ID.IDCRC + '04';
        const crcValue = crc16ccitt(newValue).toString(16).toUpperCase().padStart(4, '0');
        return format(ID.IDCRC, crcValue);
    }
    return '';
};

const l = (v: string | any[]) => {
    if (v && v !== '') {
        return pad2(v.length);
    }
    return PAD_ZERO;
};

const ll = (v: string | any[]) => {
    if (v && v !== '') {
        return pad2(v.length - 4);
    }
    return PAD_ZERO;
};

const pad2 = (num: string | number, size?: number): string => {
    if (num < 10) {
        let s = num + '';
        while (s.length < 2) s = '0' + s;
        return s;
    }
    return num + '';
};