import mongoose, { Schema, model, models } from "mongoose";
import { IImageVariant, ImageVariantType } from "./Product";

export interface IOrder {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variant: IImageVariant;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  downloadUrl?: string;
  preview?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: {
      type: {
        type: String,
        required: true,
        enum: ["SQUARE", "WIDE", "PORTRAIT"] as ImageVariantType[],
         set: (v: string) => v.toUpperCase(),
      },
      price: {
        type: Number,
        required: true,
      },
      license: {
        type: String,
        required: true,
        enum: ["personal", "commercial"],
      },
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    downloadUrl: {
      type: String,
    },
    preview: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = models?.Order || model<IOrder>("Order", orderSchema);
export default Order;
