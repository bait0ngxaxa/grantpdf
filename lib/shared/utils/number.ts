export function formatNumericWithCommas(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    const normalized = trimmed.replace(/,/g, "").replace(/\s+/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
        return trimmed;
    }

    const [integerPart, decimalPart] = normalized.split(".");
    const isNegative = integerPart.startsWith("-");
    const unsignedInteger = isNegative ? integerPart.slice(1) : integerPart;

    if (/^0\d+$/.test(unsignedInteger)) {
        return trimmed;
    }

    const formattedInteger = unsignedInteger.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ",",
    );
    const signedFormattedInteger = isNegative
        ? `-${formattedInteger}`
        : formattedInteger;

    if (!decimalPart) {
        return signedFormattedInteger;
    }

    return `${signedFormattedInteger}.${decimalPart}`;
}
