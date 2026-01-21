import { useState, useCallback } from "react";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    created_at: string;
    createdAt?: string;
}

interface EditFormData {
    name: string;
    email: string;
    role: string;
}

interface UsersResponse {
    users: UserData[];
}

export interface UserManagementHook {
    users: UserData[];
    loadingUsers: boolean;
    fetchError: string | null;
    selectedUser: UserData | null;
    editFormData: EditFormData;
    isSaving: boolean;
    isDeleting: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    isResultModalOpen: boolean;
    resultMessage: string;
    isResultSuccess: boolean;
    fetchUsers: () => Promise<void>;
    openEditModal: (user: UserData) => void;
    closeEditModal: () => void;
    handleEditFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    handleUpdateUser: (e: React.FormEvent) => Promise<void>;
    openDeleteModal: (user: UserData) => void;
    closeDeleteModal: () => void;
    handleDeleteUser: () => Promise<void>;
    closeResultModal: () => void;
}

export function useUserManagement(): UserManagementHook {
    // Data Fetching
    const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
        API_ROUTES.ADMIN_USERS,
    );

    const users =
        data?.users.map((user) => ({
            ...user,
            id: user.id.toString(),
            createdAt: new Date(user.created_at).toLocaleDateString("th-TH"),
        })) || [];

    const loadingUsers = isLoading;
    const fetchError = error ? "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้" : null;

    // UI States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const [editFormData, setEditFormData] = useState<EditFormData>({
        name: "",
        email: "",
        role: "",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [resultMessage, setResultMessage] = useState("");
    const [isResultSuccess, setIsResultSuccess] = useState(true);

    const openEditModal = useCallback((user: UserData) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsEditModalOpen(true);
    }, []);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditFormData({ name: "", email: "", role: "" });
    }, []);

    const handleEditFormChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setEditFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        [],
    );

    const handleUpdateUser = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedUser) return;

            setIsSaving(true);
            try {
                const res = await fetch(
                    `${API_ROUTES.ADMIN_USERS}/${selectedUser.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(editFormData),
                    },
                );

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to update user");
                }

                await mutate(); // Revalidate
                closeEditModal();

                setResultMessage("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
                setIsResultSuccess(true);
                setIsResultModalOpen(true);
            } catch (error: unknown) {
                console.error("Failed to update user:", error);

                setResultMessage(
                    error instanceof Error
                        ? error.message
                        : "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้",
                );
                setIsResultSuccess(false);
                setIsResultModalOpen(true);
            } finally {
                setIsSaving(false);
            }
        },
        [selectedUser, editFormData, mutate, closeEditModal],
    );

    const openDeleteModal = useCallback((user: UserData) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    }, []);

    const handleDeleteUser = useCallback(async () => {
        if (!selectedUser) return;

        setIsDeleting(true);
        try {
            const res = await fetch(
                `${API_ROUTES.ADMIN_USERS}/${selectedUser.id}`,
                {
                    method: "DELETE",
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete user");
            }

            await mutate(); // Revalidate
            closeDeleteModal();

            setResultMessage("ลบผู้ใช้สำเร็จ!");
            setIsResultSuccess(true);
            setIsResultModalOpen(true);
        } catch (error: unknown) {
            console.error("Failed to delete user:", error);

            setResultMessage(
                error instanceof Error
                    ? error.message
                    : "เกิดข้อผิดพลาดในการลบผู้ใช้",
            );
            setIsResultSuccess(false);
            setIsResultModalOpen(true);
        } finally {
            setIsDeleting(false);
        }
    }, [selectedUser, mutate, closeDeleteModal]);

    const closeResultModal = useCallback(() => {
        setIsResultModalOpen(false);
    }, []);

    return {
        users,
        loadingUsers,
        fetchError,
        selectedUser,
        editFormData,

        isSaving,
        isDeleting,

        isEditModalOpen,
        isDeleteModalOpen,
        isResultModalOpen,
        resultMessage,
        isResultSuccess,

        fetchUsers: async () => {
            await mutate();
        },
        openEditModal,
        closeEditModal,
        handleEditFormChange,
        handleUpdateUser,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteUser,
        closeResultModal,
    };
}
