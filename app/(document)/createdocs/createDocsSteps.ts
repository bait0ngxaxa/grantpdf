export type CreateDocumentStep =
  | "select-project"
  | "select-category"
  | "select-type";

export const CREATE_DOCUMENT_STEPS = [
  { id: "select-project", label: "เลือกโครงการ" },
  { id: "select-category", label: "เลือกหมวดหมู่" },
  { id: "select-type", label: "เลือกประเภท" },
] as const satisfies ReadonlyArray<{
  id: CreateDocumentStep;
  label: string;
}>;

export function getCreateDocumentStepNumber(step: CreateDocumentStep): number {
  const stepIndex = CREATE_DOCUMENT_STEPS.findIndex(({ id }) => id === step);

  if (stepIndex < 0) {
    throw new Error(`Unknown create document step: ${step}`);
  }

  return stepIndex + 1;
}
