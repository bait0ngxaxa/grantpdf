import {
    useState,
    useCallback,
    useDeferredValue,
    useMemo,
} from "react";
import useSWR from "swr";
import {
    API_ROUTES,
    PAGINATION,
    type UserRole,
} from "@/lib/shared/constants";
import type { UserApiData } from "@/type";
import { toast } from "sonner";

type UserData = UserApiData;
type EditableRole = UserRole | "";

interface RoleCounts {
    admin: number;
    member: number;
}

interface EditFormData {
    name: string;
    email: string;
    role: EditableRole;
}

interface UsersResponse {
    users: UserData[];
    total: number;
    page: number;
    totalPages: number;
    roleCounts?: RoleCounts;
}

export interface UserManagementHook {
    users: UserData[];
    total: number;
    roleCounts: RoleCounts;
    totalPages: number;
    currentPage: number;
    setPage: (page: number) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    loadingUsers: boolean;
    isInitialUsersLoading: boolean;
    fetchError: string | null;
    selectedUser: UserData | null;
    editFormData: EditFormData;
    canSaveEdit: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
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
}

export function useUserManagement(): UserManagementHook {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTermState] = useState("");
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Reset to page 1 after search changes — ensures correct results
    const setSearchTerm = useCallback((value: string) => {
        setSearchTermState(value);
        setCurrentPage(1);
    }, []);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const limit = PAGINATION.USERS_PER_PAGE;

    // SWR key includes page + search so server handles filtering/pagination
    const swrKey = useMemo(() => {
        const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(limit),
        });

        if (deferredSearchTerm) {
            params.set("search", deferredSearchTerm);
        }

        return `${API_ROUTES.ADMIN_USERS}?${params.toString()}`;
    }, [currentPage, limit, deferredSearchTerm]);

    const { data, error, isLoading, mutate } = useSWR<UsersResponse>(swrKey, {
        keepPreviousData: true,
    });

    const users =
        data?.users.map((user) => ({
            ...user,
            id: user.id.toString(),
        })) || [];

    const total = data?.total ?? 0;
    const roleCounts = data?.roleCounts ?? { admin: 0, member: 0 };
    const totalPages = data?.totalPages ?? 0;

    const loadingUsers = isLoading;
    const isInitialUsersLoading = isLoading && !data;
    const fetchError = error ? "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้" : null;

    // UI States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const [editFormData, setEditFormData] = useState<EditFormData>({
        name: "",
        email: "",
        role: "",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canSaveEdit = useMemo(() => {
        if (!selectedUser) {
            return false;
        }

        const hasRequiredFields =
            editFormData.name.trim().length > 0 &&
            editFormData.email.trim().length > 0 &&
            editFormData.role !== "";

        if (!hasRequiredFields) {
            return false;
        }

        return (
            editFormData.name !== selectedUser.name ||
            editFormData.email !== selectedUser.email ||
            editFormData.role !== selectedUser.role
        );
    }, [editFormData, selectedUser]);

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
            setEditFormData((prevData) => {
                if (name === "role") {
                    return {
                        ...prevData,
                        role: value as EditableRole,
                    };
                }

                return {
                    ...prevData,
                    [name]: value,
                };
            });
        },
        [],
    );

    const handleUpdateUser = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedUser || !canSaveEdit) return;

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
                    const errorData: unknown = await res.json().catch(() => null);
                    const message =
                        typeof errorData === "object" &&
                        errorData !== null &&
                        "error" in errorData &&
                        typeof (errorData as { error?: unknown }).error === "string"
                            ? (errorData as { error: string }).error
                            : "ไม่สามารถอัปเดตผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง";
                    throw new Error(message);
                }

                await mutate();
                closeEditModal();

                toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
            } catch (error: unknown) {
                console.error("Failed to update user:", error);

                toast.error("อัปเดตผู้ใช้งานไม่สำเร็จ", {
                    description: error instanceof Error
                        ? error.message
                        : "ไม่สามารถอัปเดตผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง",
                });
            } finally {
                setIsSaving(false);
            }
        },
        [selectedUser, canSaveEdit, editFormData, mutate, closeEditModal],
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
                const errorData: unknown = await res.json().catch(() => null);
                const message =
                    typeof errorData === "object" &&
                    errorData !== null &&
                    "error" in errorData &&
                    typeof (errorData as { error?: unknown }).error === "string"
                        ? (errorData as { error: string }).error
                        : "ไม่สามารถลบผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง";
                throw new Error(message);
            }

            await mutate();
            closeDeleteModal();

            toast.success("ลบผู้ใช้สำเร็จ!");
        } catch (error: unknown) {
            console.error("Failed to delete user:", error);

            toast.error("ลบผู้ใช้งานไม่สำเร็จ", {
                description: error instanceof Error
                    ? error.message
                    : "ไม่สามารถลบผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [selectedUser, mutate, closeDeleteModal]);

    return {
        users,
        total,
        roleCounts,
        totalPages,
        currentPage,
        setPage,
        searchTerm,
        setSearchTerm,
        loadingUsers,
        isInitialUsersLoading,
        fetchError,
        selectedUser,
        editFormData,
        canSaveEdit,

        isSaving,
        isDeleting,

        isEditModalOpen,
        isDeleteModalOpen,

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
    };
}
