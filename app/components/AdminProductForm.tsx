"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import FileUpload from "./FileUpload";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { IMAGE_VARIANTS, ImageVariantType } from "@/models/Product";
import { apiClient, ProductFormData } from "@/lib/api-client";

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      imgvariant: [
        {
          type: "SQUARE" as ImageVariantType,
          price: 9.99,
          license: "personal",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "imgvariant",
  });

  const handleUploadSuccess = (response: any) => {
    setValue("imageUrl", response.url); // Use `response.url` from ImageKit response
    console.log("Image uploaded successfully!");
  };

  const handleUploadProgress = (percent: number) => {
    console.log(`Upload progress: ${percent}%`);
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      await apiClient.createProduct(data);
      console.log("Product created successfully!");

      // Reset form
      setValue("name", "");
      setValue("description", "");
      setValue("imageUrl", "");
      setValue("imgvariant", [
        {
          type: "SQUARE" as ImageVariantType,
          price: 9.99,
          license: "personal",
        },
      ]);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="form-control">
        <label className="label">Product Name</label>
        <input
          type="text"
          className={`input input-bordered ${errors.name ? "input-error" : ""} bg-gray-800`}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-error text-sm mt-1">{errors.name.message}</span>
        )}
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="label">Description</label>
        <textarea
          className={`bg-gray-800 textarea textarea-bordered h-24 ${
            errors.description ? "textarea-error" : ""
          }`}
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <span className="text-error text-sm mt-1">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* File Upload */}
      <div className="form-control">
        <label className="label">Product Image</label>
        <FileUpload
          onSuccess={handleUploadSuccess}
          onProgress={handleUploadProgress}
          fileType="image"
        />
      </div>

      {/* Variants */}
      <div className="divider">Image Variants</div>

      {fields.map((field, index) => (
        <div key={field.id} className="card bg-base-200 p-4 bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type */}
            <div className="form-control">
              <label className="label">Size & Aspect Ratio</label>
              <select
                className="select select-bordered"
                {...register(`imgvariant.${index}.type`)}
              >
                {Object.entries(IMAGE_VARIANTS).map(([key, value]) => (
                  <option key={key} value={value.type}>
                    {value.label} ({value.dimensions.width}x
                    {value.dimensions.height})
                  </option>
                ))}
              </select>
            </div>

            {/* License */}
            <div className="form-control">
              <label className="label">License</label>
              <select
                className="select select-bordered"
                {...register(`imgvariant.${index}.license`)}
              >
                <option value="personal">Personal Use</option>
                <option value="commercial">Commercial Use</option>
              </select>
            </div>

            {/* Price */}
            <div className="form-control">
              <label className="label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input input-bordered"
                {...register(`imgvariant.${index}.price`, {
                  valueAsNumber: true,
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />
              {errors.imgvariant?.[index]?.price && (
                <span className="text-error text-sm mt-1">
                  {errors.imgvariant[index]?.price?.message}
                </span>
              )}
            </div>

            {/* Remove Button */}
            <div className="flex items-end">
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add Variant */}
      <button
        type="button"
        className="btn btn-outline btn-block"
        onClick={() =>
          append({
            type: "SQUARE" as ImageVariantType,
            price: 9.99,
            license: "personal",
          })
        }
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Variant
      </button>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Product...
          </>
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}
