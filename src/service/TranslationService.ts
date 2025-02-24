export const Translations: Record<string, Record<string, string>> = {
    PaymentMethod: {CASH: "gotówka", CASH_LATE: "gotówka terminowa", TRANSFER: "przelew"},
    BedType: {SINGLE: "pojedyncze", DOUBLE: "podwójne"},
    ReadingStatus: {
        NOT_READ: 'Nie przeczytana',
        READ_NOW: 'Czytana',
        READ: 'Przeczytana',
        ALL: 'ALL'
    },
    OwnershipStatus: {
        HAVE: 'Mam',
        WANT: 'Chcę',
        READ_ONLY: 'Tylko czytam',
        ALL: 'ALL'
    },
    EditionType: {
        BOOK: 'Książka',
        AUDIOBOOK: 'Audiobook',
        EBOOK: 'Ebook',
        ALL: 'ALL'
    },
    PaymentStatus: {
        PAID: "Zapłacone",
        TO_PAY: "Do zapłaty",
        OVER_DUE: "Przeterminowana",
        ALL: "ALL"
    }
};

export const TranslationService = {
    translateEnum(enumName: string, key: string): string {
        // console.log("translateEnum ENUM, key",enumName,key, Translations[enumName]?.[key] || key)
        return Translations[enumName]?.[key] || key;
    }
}
