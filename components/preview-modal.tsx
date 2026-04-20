"use client";

import usePreviewModal from "@/hooks/use-preview-modal";
import ProductDetailClient from "@/components/product-detail-client";
import Modal from "@/components/ui/modal";

const PreviewModal = () => {
  const isOpen = usePreviewModal((state) => state.isOpen);
  const onClose = usePreviewModal((state) => state.onClose);
  const product = usePreviewModal((state) => state.data);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ProductDetailClient product={product} layout="modal" />
    </Modal>
  );
};

export default PreviewModal;
