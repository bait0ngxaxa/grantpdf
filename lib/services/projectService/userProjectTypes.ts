export interface GetProjectsByUserIdPaginatedParams {
    userId: number;
    page: number;
    limit: number;
    programId?: number;
    search?: string;
    status?: string;
    sortBy?: string;
}

export interface ProjectStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
    editing: number;
    closed: number;
}

export interface UserProjectStatsResult {
    total: number;
    totalFiles: number;
    statusCounts: ProjectStatusCounts;
    latestProject: {
        id: string;
        name: string;
        created_at: string;
    } | null;
}
