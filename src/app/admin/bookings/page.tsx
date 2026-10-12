"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminStore } from "@/lib/store";
import type { Booking } from "@/lib/types";
import { useForm } from "react-hook-form";
import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function BookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Booking>();

  const loadBookings = async () => {
    const data = await adminStore.getBookings();
    setAllBookings(data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(allBookings);
    } else {
      setFilteredBookings(allBookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, allBookings]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    reset({
      guestName: "",
      phone: "",
      email: "",
      roomType: "Silver",
      checkIn: "",
      checkOut: "",
      guests: 1,
      status: "pending",
      notes: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (booking: Booking) => {
    setIsEditing(true);
    setSelectedBooking(booking);
    setValue("id", booking.id);
    setValue("guestName", booking.guestName);
    setValue("phone", booking.phone);
    setValue("email", booking.email);
    setValue("roomType", booking.roomType);
    setValue("checkIn", booking.checkIn);
    setValue("checkOut", booking.checkOut);
    setValue("guests", booking.guests);
    setValue("status", booking.status);
    setValue("notes", booking.notes || "");
    setIsFormModalOpen(true);
  };

  const handleOpenView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: Booking) => {
    if (isEditing && selectedBooking) {
      await adminStore.updateBooking(selectedBooking.id, data);
    } else {
      await adminStore.addBooking(data);
    }
    await loadBookings();
    setIsFormModalOpen(false);
  };

  const handleDelete = async () => {
    if (bookingToDelete) {
      await adminStore.deleteBooking(bookingToDelete.id);
      await loadBookings();
      setIsDeleteModalOpen(false);
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: Booking["status"]) => {
    await adminStore.updateBooking(booking.id, { status: newStatus });
    await loadBookings();
  };

  const columns = [
    {
      header: "Guest Name",
      accessor: "guestName" as keyof Booking,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Booking,
    },
    {
      header: "Room Type",
      accessor: "roomType" as keyof Booking,
    },
    {
      header: "Check-In",
      accessor: "checkIn" as keyof Booking,
    },
    {
      header: "Check-Out",
      accessor: "checkOut" as keyof Booking,
    },
    {
      header: "Guests",
      accessor: "guests" as keyof Booking,
    },
    {
      header: "Status",
      accessor: (booking: Booking) => <StatusBadge status={booking.status} />,
    },
    {
      header: "Actions",
      accessor: (booking: Booking) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenView(booking)}
            className="p-1 hover:text-gold transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenEdit(booking)}
            className="p-1 hover:text-gold transition-colors"
            title="Edit Booking"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenDelete(booking)}
            className="p-1 hover:text-red-500 transition-colors"
            title="Delete Booking"
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
              Bookings
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Manage room reservations and guest details
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-charcoal font-semibold text-sm rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Booking
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-warm-gray">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-cream bg-white text-sm focus:outline-none focus:border-gold"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={filteredBookings} />

        {/* View Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Booking Details"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-warm-gray">Guest Name</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.guestName}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Status</p>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Phone</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Email</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Room Type</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.roomType}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Number of Guests</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Check-In</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Check-Out</p>
                  <p className="font-semibold text-charcoal">{selectedBooking.checkOut}</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-xs text-warm-gray">Notes</p>
                  <p className="text-sm text-charcoal mt-1 p-3 bg-cream rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
              {/* Quick Actions */}
              <div className="pt-4 border-t border-cream flex gap-2">
                <button
                  onClick={() => {
                    handleStatusChange(selectedBooking, "confirmed");
                    setIsViewModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded hover:bg-green-100"
                >
                  Mark Confirmed
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedBooking, "cancelled");
                    setIsViewModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100"
                >
                  Mark Cancelled
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={isEditing ? "Edit Booking" : "New Booking"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Guest Name" error={errors.guestName?.message}>
              <input
                type="text"
                {...register("guestName", { required: "Name is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone" error={errors.phone?.message}>
                <input
                  type="text"
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Room Type" error={errors.roomType?.message}>
                <select
                  {...register("roomType")}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </FormField>
              <FormField label="Number of Guests" error={errors.guests?.message}>
                <input
                  type="number"
                  {...register("guests", { min: 1 })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-In Date" error={errors.checkIn?.message}>
                <input
                  type="date"
                  {...register("checkIn", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
              <FormField label="Check-Out Date" error={errors.checkOut?.message}>
                <input
                  type="date"
                  {...register("checkOut", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <FormField label="Status" error={errors.status?.message}>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
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
                {isEditing ? "Save Changes" : "Create Booking"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemName={bookingToDelete ? `booking for ${bookingToDelete.guestName}` : "this booking"}
        />
      </div>
    </AdminShell>
  );
}
