"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminStore } from "@/lib/store";
import type { BanquetEnquiry } from "@/lib/types";
import { useForm } from "react-hook-form";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function BanquetPage() {
  const [enquiries, setEnquiries] = useState<BanquetEnquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<BanquetEnquiry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<BanquetEnquiry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BanquetEnquiry>();

  const loadEnquiries = async () => {
    const data = await adminStore.getBanquetEnquiries();
    setEnquiries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleOpenView = (enquiry: BanquetEnquiry) => {
    setSelectedEnquiry(enquiry);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (enquiry: BanquetEnquiry) => {
    setIsEditing(true);
    setSelectedEnquiry(enquiry);
    setValue("id", enquiry.id);
    setValue("hallId", enquiry.hallId);
    setValue("name", enquiry.name);
    setValue("phone", enquiry.phone);
    setValue("email", enquiry.email);
    setValue("eventType", enquiry.eventType);
    setValue("eventDate", enquiry.eventDate);
    setValue("guests", enquiry.guests);
    setValue("message", enquiry.message);
    setValue("status", enquiry.status);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (enquiry: BanquetEnquiry) => {
    setEnquiryToDelete(enquiry);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: BanquetEnquiry) => {
    if (isEditing && selectedEnquiry) {
      await adminStore.updateBanquetEnquiry(selectedEnquiry.id, data);
    } else {
      await adminStore.addBanquetEnquiry({
        hallId: data.hallId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        eventType: data.eventType,
        eventDate: data.eventDate,
        guests: data.guests,
        message: data.message,
        status: data.status,
      });
    }
    await loadEnquiries();
    setIsFormModalOpen(false);
  };

  const handleDelete = async () => {
    if (enquiryToDelete) {
      await adminStore.deleteBanquetEnquiry(enquiryToDelete.id);
      await loadEnquiries();
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as keyof BanquetEnquiry,
    },
    {
      header: "Event Type",
      accessor: "eventType" as keyof BanquetEnquiry,
    },
    {
      header: "Guests",
      accessor: "guests" as keyof BanquetEnquiry,
    },
    {
      header: "Event Date",
      accessor: "eventDate" as keyof BanquetEnquiry,
    },
    {
      header: "Status",
      accessor: (enquiry: BanquetEnquiry) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          enquiry.status === "confirmed" ? "bg-green-100 text-green-800" :
          enquiry.status === "pending" ? "bg-amber-100 text-amber-800" :
          "bg-red-100 text-red-800"
        }`}>
          {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (enquiry: BanquetEnquiry) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenView(enquiry)}
            className="p-1 hover:text-gold transition-colors"
            title="View"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenEdit(enquiry)}
            className="p-1 hover:text-gold transition-colors"
            title="Edit"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenDelete(enquiry)}
            className="p-1 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Banquet Enquiries
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Manage banquet hall bookings and event enquiries
            </p>
          </div>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={enquiries} />

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Banquet Enquiry Details"
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
                  <p className="text-xs text-warm-gray">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedEnquiry.status === "confirmed" ? "bg-green-100 text-green-800" :
                    selectedEnquiry.status === "pending" ? "bg-amber-100 text-amber-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {selectedEnquiry.status.charAt(0).toUpperCase() + selectedEnquiry.status.slice(1)}
                  </span>
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
                  <p className="text-xs text-warm-gray">Event Type</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Event Date</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.eventDate}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Number of Guests</p>
                  <p className="font-semibold text-charcoal">{selectedEnquiry.guests}</p>
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

        {/* Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={isEditing ? "Edit Enquiry" : "New Enquiry"}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Guest Name" error={errors.name?.message}>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <input
                  type="text"
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Event Type" error={errors.eventType?.message}>
                <input
                  type="text"
                  {...register("eventType", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                  placeholder="Wedding, Corporate, etc."
                />
              </FormField>
              <FormField label="Event Date" error={errors.eventDate?.message}>
                <input
                  type="date"
                  {...register("eventDate", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <FormField label="Number of Guests" error={errors.guests?.message}>
              <input
                type="number"
                {...register("guests", { required: "Required", min: 1 })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              />
            </FormField>

            <FormField label="Status" error={errors.status?.message}>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>

            <FormField label="Message">
              <textarea
                {...register("message")}
                rows={3}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-cream">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 border border-cream text-charcoal text-sm font-semibold rounded-lg hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gold hover:bg-gold-light text-charcoal text-sm font-semibold rounded-lg"
              >
                {isEditing ? "Save Changes" : "Add Enquiry"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemName={enquiryToDelete ? `enquiry from ${enquiryToDelete.name}` : "this enquiry"}
        />
      </div>
    </AdminShell>
  );
}
