import { useState } from 'react';

export const useModalStates = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const openPreviewModal = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    previewUrl,
    previewTitle,
    showProfileModal,
    setShowProfileModal,
    showCreateProjectModal,
    setShowCreateProjectModal,
    showDeleteModal,
    setShowDeleteModal,
    showSuccessModal,
    setShowSuccessModal,
    showEditProjectModal,
    setShowEditProjectModal,
    openPreviewModal,
  };
};