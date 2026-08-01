import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const contextMocks = vi.hoisted(() => ({
  useCreateDocsContext: vi.fn(),
}));

vi.mock("@/app/(document)/createdocs/contexts", () => contextMocks);
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { CreateDocsTopBar } from "@/app/(document)/createdocs/components/CreateDocsTopBar";

describe("CreateDocsTopBar", () => {
  beforeEach(() => {
    contextMocks.useCreateDocsContext.mockReturnValue({
      currentStep: "select-type",
      goBack: vi.fn(),
    });
  });

  it("keeps the final selection within the three-step flow", () => {
    render(<CreateDocsTopBar />);

    expect(screen.getByText("ขั้นตอนที่ 3 จาก 3")).toBeInTheDocument();
    expect(screen.queryByText(/ขั้นตอนที่ 4 จาก/)).not.toBeInTheDocument();
  });
});
