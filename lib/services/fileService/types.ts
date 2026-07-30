import type { AdminDocumentFile } from "@/type/models";

export type {
    FileForDeletion,
    RawAttachment,
    RawFile,
} from "@/lib/domain/files/types";

export interface GetFilesByUserIdParams {
    userId: number;
    limit?: number;
    cursor?: string;
}

export interface UserFilesPage {
    items: AdminDocumentFile[];
    nextCursor: string | null;
}
