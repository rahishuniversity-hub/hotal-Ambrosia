"use client";

import Modal from "./Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeleteConfirm({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" size="sm">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-red-50 rounded-full">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <p className="text-sm text-charcoal">
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-cream text-charcoal text-sm font-semibold rounded-lg hover:bg-cream"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
