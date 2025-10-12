import React from 'react';

type ConfirmModalProps = {
    open: boolean;
    title?: string;
    message?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({ open, title = 'Konfirmasi', message = '', confirmLabel = 'Hapus', cancelLabel = 'Batal', onConfirm, onCancel }: ConfirmModalProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md mx-4 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l4.516 8.016c.75 1.331-.213 2.985-1.743 2.985H5.484c-1.53 0-2.493-1.654-1.743-2.985l4.516-8.016zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-7a1 1 0 00-.993.883L9 7v4a1 1 0 001.993.117L11 11V7a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <div className="text-xs text-gray-600 mt-1">{message}</div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-3 py-1 text-sm rounded bg-red-500 text-white">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
