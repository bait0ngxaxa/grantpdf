import type { Project } from "@/type";

type EditableProjectFields = Pick<Project, "name" | "description">;

function normalizeText(value: string | null | undefined): string {
    return (value ?? "").trim();
}

export function hasProjectDraftChanges(
    project: EditableProjectFields | null,
    name: string,
    description: string,
): boolean {
    if (!project) {
        return false;
    }

    return (
        normalizeText(name) !== normalizeText(project.name) ||
        normalizeText(description) !== normalizeText(project.description)
    );
}
