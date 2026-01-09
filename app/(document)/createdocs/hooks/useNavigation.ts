import { useRouter } from "next/navigation";

export interface UseNavigationReturn {
  handleProjectSelection: (projectId: string) => void;
  handleBackToProjects: () => void;
  handleBack: (
    selectedContractType: string | null,
    selectedProjectId: string | null,
    selectedCategory: string | null,
    setSelectedContractType: (type: string | null) => void,
    setSelectedProjectId: (id: string | null) => void,
    setSelectedCategory: (category: string | null) => void
  ) => void;
  handleCategorySelection: (category: string, isAdmin: boolean, setSelectedCategory: (category: string | null) => void) => void;
  handleApprovalSelection: (templateId: string, title: string) => void;
  handleContractSelection: (templateId: string, title: string, contractCode?: string) => void;
  handleFormProjectSelection: (templateId: string, title: string) => void;
  handleSummarySelection: (templateId: string, title: string) => void;
  handleTorSelection: (templateId: string, title: string) => void;
}

export const useNavigation = (): UseNavigationReturn => {
  const router = useRouter();

  // Handle project selection
  const handleProjectSelection = (projectId: string) => {
    localStorage.setItem("selectedProjectId", projectId);
  };

  // Handle back to project selection
  const handleBackToProjects = () => {
    localStorage.removeItem("selectedProjectId");
  };

  // Handle back button logic
  const handleBack = (
    selectedContractType: string | null,
    selectedProjectId: string | null,
    selectedCategory: string | null,
    setSelectedContractType: (type: string | null) => void,
    setSelectedProjectId: (id: string | null) => void,
    setSelectedCategory: (category: string | null) => void
  ) => {
    if (selectedContractType) {
      setSelectedContractType(null);
    } else if (selectedProjectId) {
      setSelectedProjectId(null);
      handleBackToProjects();
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      router.push("/userdashboard");
    }
  };

  // Handle category selection with role-based access control
  const handleCategorySelection = (category: string, isAdmin: boolean, setSelectedCategory: (category: string | null) => void) => {
    // ป้องกันไม่ให้ user ทั่วไปเข้าถึงหมวด 'general'
    if (category === "general" && !isAdmin) {
      // แสดงการแจ้งเตือนหรือเปลี่ยนเส้นทางไปหมวด project แทน
      setSelectedCategory("project");
      return;
    }
    setSelectedCategory(category);
  };

  // ✅ ฟังก์ชันสำหรับการ redirect ไป /create-word-doc
  const handleApprovalSelection = (templateId: string, title: string) => {
    // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
    const templateData = {
      id: templateId,
      title: title,
    };
    localStorage.setItem(
      "selectedApprovalTemplate",
      JSON.stringify(templateData)
    );
    // redirect ไปหน้า create-word-doc
    router.push("/create-word-approval");
  };

  const handleContractSelection = (templateId: string, title: string, contractCode?: string) => {
    // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-contract
    const templateData = {
      id: templateId,
      title: title,
      contractCode: contractCode || '', // เพิ่ม contractCode สำหรับ ABS, DMR, SIP
    };
    localStorage.setItem("selectedTorsTemplate", JSON.stringify(templateData));
    // redirect ไปหน้า create-word-contract
    router.push("/create-word-contract");
  };

  const handleFormProjectSelection = (templateId: string, title: string) => {
    // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
    const templateData = {
      id: templateId,
      title: title,
    };
    localStorage.setItem("selectedTorsTemplate", JSON.stringify(templateData));
    // redirect ไปหน้า create-word-doc
    router.push("/create-word-formproject");
  };

  const handleSummarySelection = (templateId: string, title: string) => {
      // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-summary
      const templateData = {
          id: templateId,
          title: title,
      };
      localStorage.setItem('selectedSummaryTemplate', JSON.stringify(templateData));
      // redirect ไปหน้า create-word-summary
      router.push('/create-word-summary');
  };
  
  const handleTorSelection = (templateId: string, title: string) => {
    // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
    const templateData = {
      id: templateId,
      title: title,
    };
    localStorage.setItem("selectedTorsTemplate", JSON.stringify(templateData));
    // redirect ไปหน้า create-word-doc
    router.push("/create-word-tor");
  };

  return {
    handleProjectSelection,
    handleBackToProjects,
    handleBack,
    handleCategorySelection,
    handleApprovalSelection,
    handleContractSelection,
    handleFormProjectSelection,
    handleSummarySelection,
    handleTorSelection,
  };
};