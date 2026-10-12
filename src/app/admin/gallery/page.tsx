"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminStore } from "@/lib/store";
import type { GalleryItem } from "@/lib/types";
import { useForm } from "react-hook-form";
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const CATEGORIES = ["Hotel", "Rooms", "Restaurant", "Banquet", "Other"];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GalleryItem>();

  const loadItems = async () => {
    const data = await adminStore.getGalleryItems();
    setItems(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handleOpenAdd = () => {
    setIsEditing(false);
    reset({
      type: "image",
      url: "",
      title: "",
      category: "Hotel",
      visible: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setValue("id", item.id);
    setValue("type", item.type);
    setValue("url", item.url);
    setValue("title", item.title);
    setValue("category", item.category);
    setValue("visible", item.visible);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: GalleryItem) => {
    if (isEditing && selectedItem) {
      await adminStore.updateGalleryItem(selectedItem.id, data);
    } else {
      await adminStore.addGalleryItem({
        type: data.type,
        url: data.url,
        title: data.title,
        category: data.category,
        visible: data.visible,
      });
    }
    await loadItems();
    setIsFormModalOpen(false);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await adminStore.deleteGalleryItem(itemToDelete.id);
      await loadItems();
      setIsDeleteModalOpen(false);
    }
  };

  const handleToggleVisibility = async (item: GalleryItem) => {
    await adminStore.updateGalleryItem(item.id, { visible: !item.visible });
    await loadItems();
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Gallery Management
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Manage photos and media for the gallery
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-charcoal font-semibold text-sm rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-cream pb-4">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "All"
                ? "bg-charcoal text-white"
                : "bg-white text-warm-gray hover:bg-cream"
            }`}
          >
            All Items ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-charcoal text-white"
                    : "bg-white text-warm-gray hover:bg-cream"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-cream p-12 text-center">
            <p className="text-sm text-warm-gray">No items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-cream overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square bg-cream">
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.visible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-charcoal line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-gold font-medium mt-1">{item.category}</p>
                  <p className="text-xs text-warm-gray mt-2">Type: {item.type}</p>

                  {/* Actions */}
                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-cream text-warm-gray hover:text-charcoal transition-colors"
                    >
                      {item.visible ? (
                        <>
                          <EyeSlashIcon className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-4 h-4" />
                          Show
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-warm-gray hover:text-gold transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-warm-gray hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={isEditing ? "Edit Gallery Item" : "Add Gallery Item"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Title" error={errors.title?.message}>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="e.g. Hotel Exterior"
              />
            </FormField>

            <FormField label="Image URL" error={errors.url?.message}>
              <input
                type="text"
                {...register("url", { required: "URL is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="/images/gallery/item.jpg"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Type" error={errors.type?.message}>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </FormField>
              <FormField label="Category" error={errors.category?.message}>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                {...register("visible")}
                className="rounded border-cream text-gold focus:ring-gold"
              />
              <label htmlFor="visible" className="text-sm text-charcoal">
                Visible on website
              </label>
            </div>

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
                {isEditing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemName={itemToDelete ? itemToDelete.title : "this item"}
        />
      </div>
    </AdminShell>
  );
}
