import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 transition-all duration-200 scale-100 opacity-100">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        <div className="mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 