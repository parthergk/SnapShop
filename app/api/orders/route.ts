import { authOptions } from "@/lib/auth";
import { connectToDataBase } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variant } = await req.json();

    if (!productId || !variant?.price) {
      return NextResponse.json(
        { error: "Missing productId or variant" },
        { status: 400 }
      );
    }

    await connectToDataBase();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(variant.price * 100),
      currency: "USD",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: productId.toString(),
      },
    });

    // Save to DB
    const newOrder = await Order.create({
      userId: session.user.id,
      productId,
      variant,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      status: "pending",
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
