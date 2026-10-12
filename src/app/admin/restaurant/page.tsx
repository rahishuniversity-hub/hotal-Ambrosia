"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminStore } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { useForm } from "react-hook-form";
import { PlusIcon, PencilSquareIcon, TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import { MENU_CATEGORIES } from "@/lib/menuData";

const CATEGORIES = MENU_CATEGORIES.filter((c) => c !== "All");

export default function RestaurantPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuItem>();

  const loadMenuItems = async () => {
    const data = await adminStore.getMenuItems();
    setMenuItems(data);
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const filteredItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const handleOpenAdd = () => {
    setIsEditing(false);
    reset({
      name: "",
      category: "Main Course",
      price: 250,
      description: "",
      image: "/images/restaurant/REASTURANT-201.jpg",
      available: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setValue("id", item.id);
    setValue("name", item.name);
    setValue("category", item.category);
    setValue("price", item.price);
    setValue("description", item.description);
    setValue("image", item.image);
    setValue("available", item.available);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: MenuItem) => {
    const processedData = {
      ...data,
      price: Number(data.price),
    };

    if (isEditing && selectedItem) {
      await adminStore.updateMenuItem(selectedItem.id, processedData);
    } else {
      await adminStore.addMenuItem(processedData);
    }
    await loadMenuItems();
    setIsFormModalOpen(false);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await adminStore.deleteMenuItem(itemToDelete.id);
      await loadMenuItems();
      setIsDeleteModalOpen(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await adminStore.updateMenuItem(item.id, { available: !item.available });
    await loadMenuItems();
  };

  const columns = [
    {
      header: "Item Name",
      accessor: "name" as keyof MenuItem,
    },
    {
      header: "Category",
      accessor: "category" as keyof MenuItem,
    },
    {
      header: "Price",
      accessor: (item: MenuItem) => `₹${item.price}`,
    },
    {
      header: "Status",
      accessor: (item: MenuItem) => (
        <button
          onClick={() => handleToggleAvailability(item)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            item.available
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {item.available ? "Available" : "Unavailable"}
        </button>
      ),
    },
    {
      header: "Actions",
      accessor: (item: MenuItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1 hover:text-gold transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenDelete(item)}
            className="p-1 hover:text-red-500 transition-colors"
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
              Restaurant Menu
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Manage multi-cuisine restaurant items, prices, and availability
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal hover:bg-charcoal-lighter text-gold font-semibold text-sm rounded-lg transition-colors shadow-sm"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Live Kitchen Orders →
            </Link>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-charcoal font-semibold text-sm rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>
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
            All Items ({menuItems.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat).length;
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

        {/* Table */}
        <DataTable columns={columns} data={filteredItems} />

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={isEditing ? "Edit Menu Item" : "Add Menu Item"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Item Name" error={errors.name?.message}>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="e.g. Paneer Butter Masala"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
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
              <FormField label="Price (₹)" error={errors.price?.message}>
                <input
                  type="number"
                  {...register("price", { required: "Required", min: 0 })}
                  className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="Describe the dish, ingredients, etc."
              />
            </FormField>

            <FormField label="Image URL">
              <input
                type="text"
                {...register("image")}
                className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
                placeholder="/images/restaurant/REASTURANT-201.jpg"
              />
            </FormField>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                {...register("available")}
                className="rounded border-cream text-gold focus:ring-gold"
              />
              <label htmlFor="available" className="text-sm text-charcoal">
                Item is currently available
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
          itemName={itemToDelete ? itemToDelete.name : "this item"}
        />
      </div>
    </AdminShell>
  );
}
