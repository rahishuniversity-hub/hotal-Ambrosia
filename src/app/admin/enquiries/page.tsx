"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { adminStore } from "@/lib/store";
import type { Enquiry } from "@/lib/types";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadEnquiries = async () => {
    const data = await adminStore.getEnquiries();
    setEnquiries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleOpenView = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.read) {
      await adminStore.updateEnquiry(enquiry.id, { read: true });
      await loadEnquiries();
    }
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await adminStore.deleteEnquiry(id);
    await loadEnquiries();
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as keyof Enquiry,
    },
    {
      header: "Email",
      accessor: "email" as keyof Enquiry,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Enquiry,
    },
    {
      header: "Status",
      accessor: (enquiry: Enquiry) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          enquiry.read ? "bg-gray-100 text-gray-800" : "bg-amber-100 text-amber-800"
        }`}>
          {enquiry.read ? "Read" : "Unread"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (enquiry: Enquiry) => new Date(enquiry.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (enquiry: Enquiry) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenView(enquiry)}
            className="p-1 hover:text-gold transition-colors"
            title="View"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(enquiry.id)}
            className="p-1 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const unreadCount = enquiries.filter((e) => !e.read).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal">
            Contact Enquiries
          </h1>
          <p className="text-warm-gray text-sm mt-1">
            Manage visitor enquiries and messages {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={enquiries} />

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Enquiry Details"
          size="lg"
        >
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-warm-gray">Name</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Email</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Phone</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Date</p>
                  <p className="font-semibold text-charcoal">
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-warm-gray">Message</p>
                <p className="text-sm text-charcoal mt-1 p-3 bg-cream rounded-lg whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-cream">
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="px-4 py-2 bg-gold hover:bg-gold-light text-charcoal text-sm font-semibold rounded-lg"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminShell>
  );
}
