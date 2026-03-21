export function scrollToFirstError(errorFields: string[]): void {
    if (errorFields.length === 0) return;

    const firstErrorField = document.querySelector(
        `[name="${errorFields[0]}"]`,
    );

    if (firstErrorField) {
        firstErrorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        (firstErrorField as HTMLElement).focus();
    }
}
