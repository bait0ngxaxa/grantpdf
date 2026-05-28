"use client";

import React from "react";
import { Building2, FileText, Clock } from "lucide-react";
import { useUserDashboardContext } from "../contexts";

import { StatsCard } from "./StatsCard";
import { ProjectStatusDetails } from "./ProjectStatusDetails";

const truncateProjectName = (name: string, maxLength: number = 24): string => {
    if (name.length <= maxLength) {
        return name;
    }

    return `${name.slice(0, maxLength - 3)}...`;
};

export const StatsCards: React.FC = () => {
    const { totalProjects, totalDocuments, statusCounts, latestProject } =
        useUserDashboardContext();

    // statusCounts now comes directly from the server via context
    const projectStatusCounts = statusCounts;

    return (
        <div className="mb-8 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {/* Total Projects Card */}
            <StatsCard
                title="โครงการทั้งหมด"
                value={totalProjects}
                subtitle="โครงการที่คุณสร้าง"
                icon={<Building2 className="h-7 w-7" />}
                colorTheme="blue"
            >
                {totalProjects > 0 && (
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
                        ? truncateProjectName(latestProject.name)
                        : "-"
                }
                valueTitle={latestProject?.name}
                subtitle={
                    latestProject
                        ? new Date(latestProject.created_at).toLocaleDateString(
                              "th-TH",
                          )
                        : "ยังไม่มีโครงการ"
                }
                icon={<Clock className="h-7 w-7" />}
                colorTheme="green"
            />
        </div>
    );
};
