export const Translations: Record<string, Record<string, string>> = {
    PaymentMethod: {CASH: "gotówka", CASH_LATE: "gotówka terminowa", TRANSFER: "przelew"},
    BedType: {SINGLE: "pojedyncze", DOUBLE: "podwójne"},
    ReadingStatus: {
        NOT_READ: 'Nie przeczytana',
        READ_NOW: 'Czytana',
        READ: 'Przeczytana',
    },
    OwnershipStatus: {
        HAVE: 'Mam',
        WANT: 'Chcę',
        READ_ONLY: 'Tylko czytam',
    },
    EditionType: {
        BOOK: 'Książka',
        AUDIOBOOK: 'Audiobook',
        EBOOK: 'Ebook',
    },
    PaymentStatus: {
        PAID: "Zapłacone",
        TO_PAY: "Do zapłaty",
        OVER_DUE: "Przeterminowana",
    },
    ComputerType: {
        LAPTOP: "Laptop",
        DESKTOP: "Desktop",
        TABLET: "Tablet",
    }

};

export const TranslationService = {
    translateEnum(enumName: string, key: string): string {
        // console.log("translateEnum ENUM, key",enumName,key, Translations[enumName]?.[key] || key)
        return Translations[enumName]?.[key] || key;
    },

    translateMonth(month: number) {
        switch (month) {
            case 1:
                return 'Styczeń'
            case 2:
                return 'Luty'
            case 3:
                return 'Marzec'
            case 4:
                return 'Kwiecień'
            case 5:
                return 'Maj'
            case 6:
                return 'Czerwiec'
            case 7:
                return 'Lipiec'
            case 8:
                return 'Sierpień'
            case 9:
                return 'Wrzesień'
            case 10:
                return 'Październik'
            case 11:
                return 'Listopad'
            case 12:
                return 'Grudzień'
            default:
                return 'null'
        }
    }
}
