import {  AdditionalDataFieldTemplate, EMVQR, MerchantAccountInformation, MerchantInformationLanguageTemplate, Constants, UnreservedTemplate, IEMVQR, EthereumTransactionDataFieldTemplate } from "./types"

const buildTags = (accumulator : any, currentCharacter: any) => {
    const currentTag = accumulator[accumulator.length - 1];
    if (!currentTag.id) {
        currentTag.id = currentCharacter;
    }
    else if (currentTag.id.length < 2) {
        currentTag.id += currentCharacter;
    }
    else if (!currentTag.length) {
        currentTag.length = currentCharacter;
    }
    else if (currentTag.length.length < 2 || (isNaN(currentTag.id[0]) && currentTag.length.length < 3)) {
        currentTag.length += currentCharacter;
    }
    else if (!currentTag.value) {
        currentTag.value = currentCharacter;
    }
    else if (currentTag.value.length < currentTag.length) {
        currentTag.value += currentCharacter;
    }
    else {
        accumulator.push({ id: currentCharacter });
        return accumulator;
    }
    accumulator[accumulator.length - 1] = currentTag;
    return accumulator;
};

const parseAdditionalDataFieldTemplate = (tags: Array<any>) => {
    const result = tags.reduce((additionalDataFieldTemplate, tag) => {
        switch (tag.id) {
            case Constants.ADDITIONAL_FIELD.AdditionalIDBillNumber:
                additionalDataFieldTemplate.setBillNumber(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDMobileNumber:
                additionalDataFieldTemplate.setMobileNumber(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDStoreLabel:
                additionalDataFieldTemplate.setStoreLabel(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDLoyaltyNumber:
                additionalDataFieldTemplate.setLoyaltyNumber(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDReferenceLabel:
                additionalDataFieldTemplate.setReferenceLabel(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDCustomerLabel:
                additionalDataFieldTemplate.setCustomerLabel(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDTerminalLabel:
                additionalDataFieldTemplate.setTerminalLabel(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDPurposeTransaction:
                additionalDataFieldTemplate.setPurposeTransaction(tag.value);
                break;
            case Constants.ADDITIONAL_FIELD.AdditionalIDAdditionalConsumerDataRequest:
                additionalDataFieldTemplate.setAdditionalConsumerDataRequest(tag.value);
                break;
            default:
                if (tag.id >= Constants.ADDITIONAL_FIELD.AdditionalIDPaymentSystemSpecificTemplatesRangeStart && tag.id <= Constants.ADDITIONAL_FIELD.AdditionalIDPaymentSystemSpecificTemplatesRangeEnd) {
                    const paymentSystemSpecificTags = tag.value.split('').reduce(buildTags, [{}]);
                    const t = parseMerchantAccountInformation(paymentSystemSpecificTags);
                    additionalDataFieldTemplate.addPaymentSystemSpecific(tag.id, t);
                }
                else if (tag.id >= Constants.ADDITIONAL_FIELD.AdditionalIDRFUforEMVCoRangeStart && tag.id <= Constants.ADDITIONAL_FIELD.AdditionalIDRFUforEMVCoRangeEnd) {
                    additionalDataFieldTemplate.addRFUforEMVCo(tag.id, tag.value);
                }
        }
        return additionalDataFieldTemplate;
    }, AdditionalDataFieldTemplate());
    return result;
};
const parseEthereumTransactionFieldTemplate = (tags: Array<any>) => {
    const result = tags.reduce((ethereumTransactionFieldTemplate, tag) => {
        switch (tag.id) {
            case Constants.ETHEREUM_TRANSACTION.NONCE:
                ethereumTransactionFieldTemplate.setNonce(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.FROM:
                ethereumTransactionFieldTemplate.setFrom(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.TO:
                ethereumTransactionFieldTemplate.setTo(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.CHAIN_ID:
                ethereumTransactionFieldTemplate.setChainId(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.VALUE:
                ethereumTransactionFieldTemplate.setValue(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.GAS:
                ethereumTransactionFieldTemplate.setGas(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.GAS_PRICE:
                ethereumTransactionFieldTemplate.setGasPrice(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.DATA:
                ethereumTransactionFieldTemplate.setData(tag.value);
                break;
            case Constants.ETHEREUM_TRANSACTION.INTERACT_WTIH:
                ethereumTransactionFieldTemplate.setInteractWith(tag.value);
                break;
            default:
                // if (tag.id >= Constants.ADDITIONAL_FIELD.AdditionalIDPaymentSystemSpecificTemplatesRangeStart && tag.id <= Constants.ADDITIONAL_FIELD.AdditionalIDPaymentSystemSpecificTemplatesRangeEnd) {
                //     const paymentSystemSpecificTags = tag.value.split('').reduce(buildTags, [{}]);
                //     const t = parseMerchantAccountInformation(paymentSystemSpecificTags);
                //     ethereumTransactionFieldTemplate.addPaymentSystemSpecific(tag.id, t);
                // }
                if (tag.id >= Constants.ETHEREUM_TRANSACTION.AdditionalIDRFUforEMVCoRangeStart && tag.id <= Constants.ETHEREUM_TRANSACTION.AdditionalIDRFUforEMVCoRangeEnd) {
                    ethereumTransactionFieldTemplate.addRFUforEMVCo(tag.id, tag.value);
                }
        }
        return ethereumTransactionFieldTemplate;
    }, EthereumTransactionDataFieldTemplate());
    return result;
};

const parseMerchantInformationLanguageTemplate = (tags: Array<any>) => {
    const result = tags.reduce((merchantInformationLanguageTemplate, tag) => {
        switch (tag.id) {
            case Constants.MERCHANT_INFORMATION.MerchantInformationIDLanguagePreference:
                merchantInformationLanguageTemplate.setLanguagePreference(tag.value);
                break;
            case Constants.MERCHANT_INFORMATION.MerchantInformationIDMerchantName:
                merchantInformationLanguageTemplate.setMerchantName(tag.value);
                break;
            case Constants.MERCHANT_INFORMATION.MerchantInformationIDMerchantCity:
                merchantInformationLanguageTemplate.setMerchantCity(tag.value);
                break;
            default:
                if (tag.id >= Constants.MERCHANT_INFORMATION.MerchantInformationIDRFUforEMVCoRangeStart && tag.id <= Constants.MERCHANT_INFORMATION.MerchantInformationIDRFUforEMVCoRangeEnd) {
                    merchantInformationLanguageTemplate.addRFUForEMVCo(tag.id, tag.value);
                }
        }
        return merchantInformationLanguageTemplate;
    }, MerchantInformationLanguageTemplate());
    return result;
};

const parseMerchantAccountInformation = (tags: Array<any>) => {
    const result = tags.reduce((merchantAccountInformation, tag) => {
        switch (tag.id) {
            case Constants.MERCHANT_ACCOUNT_INFORMATION.MerchantAccountInformationIDGloballyUniqueIdentifier:
                merchantAccountInformation.setGloballyUniqueIdentifier(tag.value);
                break;
            default:
                if (tag.id >= Constants.MERCHANT_ACCOUNT_INFORMATION.MerchantAccountInformationIDPaymentNetworkSpecificStart && tag.id <= Constants.MERCHANT_ACCOUNT_INFORMATION.MerchantAccountInformationIDPaymentNetworkSpecificEnd) {
                    merchantAccountInformation.addPaymentNetworkSpecific(tag.id, tag.value);
                }
        }
        return merchantAccountInformation;
    }, MerchantAccountInformation());
    return result;
};

const parseUnreservedTemplate = (tags: Array<any>) => {
    const result = tags.reduce((unreservedTemplate, tag) => {
        switch (tag.id) {
            case Constants.UNRESERVED_TEMPLATE.UnreservedTemplateIDGloballyUniqueIdentifier:
                unreservedTemplate.setGloballyUniqueIdentifier(tag.value);
                break;
            default:
                if (tag.id >= Constants.UNRESERVED_TEMPLATE.UnreservedTemplateIDContextSpecificDataStart && tag.id <= Constants.UNRESERVED_TEMPLATE.UnreservedTemplateIDContextSpecificDataEnd) {
                    unreservedTemplate.addContextSpecificData(tag.id, tag.value);
                }
        }
        return unreservedTemplate;
    }, UnreservedTemplate());
    return result;
};

export const toEMVQR = (qrcodeValue: string) => {
    const tags = qrcodeValue.split('').reduce(buildTags, [{}]);
    const result = tags.reduce((emvqr: IEMVQR, tag: any) => {
        switch (tag.id) {
            case Constants.ID.IDPayloadFormatIndicator:
                emvqr.setPayloadFormatIndicator(tag.value);
                break;
            case Constants.ID.IDPointOfInitiationMethod:
                emvqr.setPointOfInitiationMethod(tag.value);
                break;
            case Constants.ID.IDMerchantCategoryCode:
                emvqr.setMerchantCategoryCode(tag.value);
                break;
            case Constants.ID.IDTransactionCurrency:
                emvqr.setTransactionCurrency(tag.value);
                break;
            case Constants.ID.IDTransactionAmount:
                emvqr.setTransactionAmount(tag.value);
                break;
            case Constants.ID.IDTipOrConvenienceIndicator:
                emvqr.setTipOrConvenienceIndicator(tag.value);
                break;
            case Constants.ID.IDValueOfConvenienceFeeFixed:
                emvqr.setValueOfConvenienceFeeFixed(tag.value);
                break;
            case Constants.ID.IDValueOfConvenienceFeePercentage:
                emvqr.setValueOfConvenienceFeePercentage(tag.value);
                break;
            case Constants.ID.IDCountryCode:
                emvqr.setCountryCode(tag.value);
                break;
            case Constants.ID.IDMerchantName:
                emvqr.setMerchantName(tag.value);
                break;
            case Constants.ID.IDMerchantCity:
                emvqr.setMerchantCity(tag.value);
                break;
            case Constants.ID.IDPostalCode:
                emvqr.setPostalCode(tag.value);
                break;
            case Constants.ID.IDAdditionalDataFieldTemplate:
                const additionalDataFieldTemplateTags = tag.value.split('').reduce(buildTags, [{}]);
                const adft = parseAdditionalDataFieldTemplate(additionalDataFieldTemplateTags);
                emvqr.setAdditionalDataFieldTemplate(adft);
                break;
            case Constants.ID.IDEthereumTransaction:
                const ethereumTransactionFieldTemplateTags = tag.value.split('').reduce(buildTags, [{}]);
                const etft = parseEthereumTransactionFieldTemplate(ethereumTransactionFieldTemplateTags);
                emvqr.setEthereumTransactionDataFieldTemplate(etft);
                break;
            case Constants.ID.IDCRC:
                emvqr.setCRC(tag.value);
                break;
            case Constants.ID.IDMerchantInformationLanguageTemplate:
                const merchantInformarionLanguageTemplateTags = tag.value.split('').reduce(buildTags, [{}]);
                const t = parseMerchantInformationLanguageTemplate(merchantInformarionLanguageTemplateTags);
                emvqr.setMerchantInformationLanguageTemplate(t);
                break;
            default:

                if (tag.id >= Constants.ID.IDMerchantAccountInformationRangeStart && tag.id <= Constants.ID.IDMerchantAccountInformationRangeEnd) {
                    const merchantAccountInformationTags = tag.value.split('').reduce(buildTags, [{}]);
                    const t = parseMerchantAccountInformation(merchantAccountInformationTags);
                    emvqr.addMerchantAccountInformation(tag.id, t);
                }
                else if (tag.id >= Constants.ID.IDRFUForEMVCoRangeStart && tag.id <= Constants.ID.IDRFUForEMVCoRangeEnd) {
                    emvqr.addRFUforEMVCo(tag.id, tag.value);
                }
                else if (tag.id >= Constants.ID.IDUnreservedTemplatesRangeStart && tag.id <= Constants.ID.IDUnreservedTemplatesRangeEnd) {
                    const unreservedTemplateTags = tag.value.split('').reduce(buildTags, [{}]);
                    const t = parseUnreservedTemplate(unreservedTemplateTags);
                    emvqr.addUnreservedTemplates(tag.id, t);
                }
        }
        return emvqr;
    }, EMVQR());
    return result;
};

/* Parse a code to object */
export const parse = (code: string) => {
    const emvqr = toEMVQR(code)

    const parseLines = (lines: string[], insideTemplate = false) => {
        const object : any = {}

        for(let i = 0; i < lines.length; i++) {
            const line = lines[i]

            const params = line.split(" ")

            if (insideTemplate) {
                if (params.length >= 4) {
                    object[params[1]] = params.slice(3).join(" ")
                    continue
                } else break
            } else {
                if (params.length >= 3) {
                    object[params[0]] = params.slice(2).join(" ")
                    continue
                }
                if (params.length === 2) {
                    object[params[0]] = parseLines(lines.slice(i + 1, lines.length), true)
                    i += Object.keys(object[params[0]]).length
                }
            }
        }

        return object
    }
    return parseLines((emvqr.rawData() as string).split("\n"))
}

