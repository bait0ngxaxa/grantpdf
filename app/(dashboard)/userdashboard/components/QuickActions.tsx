"use client";

import React from "react";
import { Building2, Plus } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";
import { useUserDashboardContext } from "../contexts";
import { USER_DASHBOARD_TAB } from "@/lib/shared/constants";

export const QuickActions: React.FC = () => {
    const { setActiveTab, setShowCreateProjectModal } =
        useUserDashboardContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
                title="จัดการโครงการ"
                description="ดูสถานะและจัดการเอกสารในโครงการทั้งหมดของคุณ"
                buttonText="ดูโครงการทั้งหมด"
                onClick={() => setActiveTab(USER_DASHBOARD_TAB.PROJECTS)}
                icon={<Building2 className="h-6 w-6" />}
                variant="default"
            />

            <QuickActionCard
                title="สร้างโครงการใหม่"
                description="เริ่มสร้างโครงการใหม่เพื่อจัดการเอกสาร สัญญา และ TOR"
                buttonText="สร้างโครงการเลย"
                onClick={() => setShowCreateProjectModal(true)}
                icon={<Plus className="h-6 w-6 text-white" />}
                variant="gradient"
            />
        </div>
    );
};
