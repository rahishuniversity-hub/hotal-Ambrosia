"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminStore } from "@/lib/store";
import type { Room } from "@/lib/types";
import { useForm } from "react-hook-form";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Room>();

  const loadRooms = async () => {
    const data = await adminStore.getRooms();
    setRooms(data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    reset({
      name: "",
      type: "Silver",
      price: { single: 1800, double: 2300 },
      description: "",
      facilities: [],
      images: ["/images/rooms/ROOM-101.jpg"],
      status: "available",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setIsEditing(true);
    setSelectedRoom(room);
    setValue("id", room.id);
    setValue("name", room.name);
    setValue("type", room.type);
    setValue("price", room.price);
    setValue("description", room.description);
    setValue("facilities", room.facilities);
    setValue("images", room.images);
    setValue("status", room.status);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: Room) => {
    // Process facilities if provided as comma-separated
    const processedData = {
      ...data,
      price: {
        single: Number(data.price.single),
        double: Number(data.price.double),
      },
      facilities: typeof data.facilities === "string"
        ? (data.facilities as string).split(",").map((s) => s.trim())
        : data.facilities,
    };

    if (isEditing && selectedRoom) {
      await adminStore.updateRoom(selectedRoom.id, processedData);
    } else {
      await adminStore.addRoom(processedData);
    }
    await loadRooms();
    setIsFormModalOpen(false);
  };

  const handleDelete = async () => {
    if (roomToDelete) {
      await adminStore.deleteRoom(roomToDelete.id);
      await loadRooms();
      setIsDeleteModalOpen(false);
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const newStatus = room.status === "available" ? "occupied" : "available";
    await adminStore.updateRoom(room.id, { status: newStatus });
    await loadRooms();
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Rooms Management
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Add, edit, or configure hotel room details and pricing
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-charcoal font-semibold text-sm rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Room
          </button>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-md border border-cream overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/9] w-full bg-cream">
                  <Image
                    src={room.images[0] || "/images/rooms/ROOM-101.jpg"}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        room.status === "available"
                          ? "bg-green-100 text-green-800"
                          : room.status === "maintenance"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-charcoal">
                    {room.name}
                  </h3>
                  <p className="text-xs text-gold font-medium uppercase tracking-wider mt-1">
                    {room.type}
                  </p>
                  <p className="text-sm text-warm-gray mt-3 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-cream">
                    <div>
                      <p className="text-xs text-warm-gray">Single Occupancy</p>
                      <p className="text-lg font-bold text-charcoal">
                        ₹{room.price.single}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-warm-gray">Double Occupancy</p>
                      <p className="text-lg font-bold text-charcoal">
                        ₹{room.price.double}
                      </p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {room.facilities.map((fac, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-cream rounded text-xs text-warm-gray"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-cream/30 border-t border-cream flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(room)}
                  className="text-xs font-semibold text-warm-gray hover:text-charcoal"
                >
                  Mark as {room.status === "available" ? "Occupied" : "Available"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-warm-gray hover:text-gold transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(room)}
                    className="p-1.5 text-warm-gray hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={isEditing ? "Edit Room" : "Add Room"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Room Name" error={errors.name?.message}>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="e.g. Deluxe Silver Room"
              />
            </FormField>

            <FormField label="Room Type" error={errors.type?.message}>
              <select
                {...register("type")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Single Price (₹)" error={errors.price?.single?.message}>
                <input
                  type="number"
                  {...register("price.single", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
              <FormField label="Double Price (₹)" error={errors.price?.double?.message}>
                <input
                  type="number"
                  {...register("price.double", { required: "Required" })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message}>
              <textarea
                {...register("description", { required: "Required" })}
                rows={3}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              />
            </FormField>

            <FormField label="Facilities (comma-separated)">
              <input
                type="text"
                {...register("facilities")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="Wi-Fi, AC, TV, Coffee Maker"
              />
            </FormField>

            <FormField label="Image URL">
              <input
                type="text"
                {...register("images.0")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="/images/rooms/ROOM-101.jpg"
              />
            </FormField>

            <FormField label="Status">
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
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
                {isEditing ? "Save Changes" : "Add Room"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemName={roomToDelete ? roomToDelete.name : "this room"}
        />
      </div>
    </AdminShell>
  );
}
