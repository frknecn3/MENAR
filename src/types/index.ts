export type DisclosureListItem = {
    disclosureBasic: {
        "title": string,
        "mkkMemberOid": string,
        "companyTitle": string,
        "stockCode": string,
        "relatedStocks": any,
        "disclosureClass": string,
        "disclosureType": string,
        "disclosureCategory": string,
        "publishDate": string,
        "disclosureId": string,
        "disclosureIndex": number,
        "summary": string,
        "attachmentCount": number,
        "year": number | null,
        "donem": number | null,
        "period": string,
        "hasMultiLanguageSupport": "Y" | "N",
        "fundType": string | null,
        "isLate": boolean,
        "relatedDisclosureOid": string,
        "senderType": string | null,
        "isChanged": string,
        "isBlocked": boolean

    },
    disclosureDetail: {
        "ftNiteligi": null,
        "decimalDegree": null,
        "opinion": null,
        "opinionType": null,
        "auditType": null,
        "mainDisclosureDocumentId": null,
        "opinionMemberTitle": null,
        "relatedDisclosureIndex": null,
        "oldKap": false,
        "fundOid": null,
        "senderTypes": null,
        "nonInactiveCount": null,
        "blockedDescription": null,
        "memberType": null
    }
}