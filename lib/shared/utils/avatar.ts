const THAI_INITIAL_SKIP_PATTERN = /[\u0e30-\u0e3a\u0e40-\u0e4e]/u;
const AVATAR_INITIAL_PATTERN = /[\p{L}\p{N}]/u;
const THAI_NAME_PREFIX_PATTERN = /^(?:นาย|นางสาว|นาง)\s*/u;

function findAvatarInitial(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const normalizedValue = value.trim().replace(THAI_NAME_PREFIX_PATTERN, "");

    for (const character of normalizedValue) {
        if (THAI_INITIAL_SKIP_PATTERN.test(character)) {
            continue;
        }

        if (AVATAR_INITIAL_PATTERN.test(character)) {
            return character.toLocaleUpperCase("th-TH");
        }
    }

    return null;
}

export function getAvatarInitial(
    primary: string | null | undefined,
    fallback: string | null | undefined,
    defaultInitial: string,
): string {
    return (
        findAvatarInitial(primary) ??
        findAvatarInitial(fallback) ??
        defaultInitial
    );
}
