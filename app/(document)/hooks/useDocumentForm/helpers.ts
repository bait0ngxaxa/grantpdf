export function checkIsDirty<T extends object>(formData: T): boolean {
    return Object.values(formData).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value !== "";
        return value !== null && value !== undefined;
    });
}

/**
 * Build FormData from form data object
 */
export function buildFormData<T extends object>(formData: T): FormData {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            data.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
            data.append(key, String(value));
        }
    });

    return data;
}

/**
 * Append session info to FormData
 */
export function appendSessionInfo(
    data: FormData,
    session: { user?: { id?: string | number; email?: string | null } } | null,
    projectId?: string,
    accessToken?: string,
): void {
    if (session?.user?.id) {
        data.append("userId", session.user.id.toString());
    }
    if (session?.user?.email) {
        data.append("userEmail", session.user.email);
    }
    if (projectId) {
        data.append("projectId", projectId);
    }
    if (accessToken) {
        data.append("token", accessToken);
    }
}
