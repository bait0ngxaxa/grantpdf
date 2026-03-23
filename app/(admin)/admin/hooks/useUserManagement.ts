import {
    useState,
    useCallback,
    useDeferredValue,
    useMemo,
} from "react";
import useSWR from "swr";
import { API_ROUTES, PAGINATION } from "@/lib/constants";
import { toast } from "sonner";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    created_at: string;
}

interface RoleCounts {
    admin: number;
    member: number;
}

interface EditFormData {
    name: string;
    email: string;
    role: string;
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

                await mutate();
                closeEditModal();

                toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
            } catch (error: unknown) {
                console.error("Failed to update user:", error);

                toast.error("ข้อผิดพลาด", {
                    description: error instanceof Error
                        ? error.message
                        : "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้"
                });
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

            await mutate();
            closeDeleteModal();

            toast.success("ลบผู้ใช้สำเร็จ!");
        } catch (error: unknown) {
            console.error("Failed to delete user:", error);

            toast.error("ข้อผิดพลาด", {
                description: error instanceof Error
                    ? error.message
                    : "เกิดข้อผิดพลาดในการลบผู้ใช้"
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
