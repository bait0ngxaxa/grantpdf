import React, { useMemo } from "react";
import { Building2, FileText, Clock } from "lucide-react";
import type { Project } from "@/type";
import { PROJECT_STATUS } from "@/type/models";
import { truncateFileName } from "@/lib/utils";

import { StatsCard } from "../StatsCard";
import { ProjectStatusDetails } from "../ProjectStatusDetails";

interface StatsCardsProps {
    projects: Project[];
    totalDocuments: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    projects,
    totalDocuments,
}) => {
    const projectStatusCounts = useMemo(() => {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            editing: 0,
            closed: 0,
        };

        projects.forEach((project) => {
            const status = project.status || PROJECT_STATUS.IN_PROGRESS;
            switch (status) {
                case PROJECT_STATUS.IN_PROGRESS:
                    counts.pending++;
                    break;
                case PROJECT_STATUS.APPROVED:
                    counts.approved++;
                    break;
                case PROJECT_STATUS.REJECTED:
                    counts.rejected++;
                    break;
                case PROJECT_STATUS.EDIT:
                    counts.editing++;
                    break;
                case PROJECT_STATUS.CLOSED:
                    counts.closed++;
                    break;
            }
        });

        return counts;
    }, [projects]);

    const latestProject = projects.length > 0 ? projects[0] : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Projects Card */}
            <StatsCard
                title="โครงการทั้งหมด"
                value={projects.length}
                subtitle="โครงการที่คุณสร้าง"
                icon={<Building2 className="h-7 w-7" />}
                colorTheme="blue"
            >
                {projects.length > 0 && (
                    <ProjectStatusDetails counts={projectStatusCounts} />
                )}
            </StatsCard>

            {/* Total Documents Card */}
            <StatsCard
                title="เอกสารทั้งหมด"
                value={totalDocuments}
                subtitle="เอกสารจากทุกโครงการ"
                icon={<FileText className="h-7 w-7" />}
                colorTheme="purple"
            />

            {/* Latest Project Card */}
            <StatsCard
                title="โครงการล่าสุด"
                value={
                    latestProject
                        ? truncateFileName(latestProject.name, 20)
                        : "-"
                }
                subtitle={
                    latestProject
                        ? new Date(latestProject.created_at).toLocaleDateString(
                              "th-TH"
                          )
                        : "ยังไม่มีโครงการ"
                }
                icon={<Clock className="h-7 w-7" />}
                colorTheme="green"
            />
        </div>
    );
};
