import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDataBase } from "@/lib/db";
import Order from "@/models/Order";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const event = JSON.parse(body);
    await connectToDataBase();
    
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const order = await Order.findOneAndUpdate({
        razorpayPaymentId: payment.id,
        status: "completed",
      }).populate([
        { path: "productId", select: "name" },
        { path: "userId", select: "emial" },
      ]);

      if (order) {
        const transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          secure: false,
          auth: {
            user: "18141156d7ed80",
            pass: "2afafc9f5cbe61",
          },
        });

        //mail template
        await transporter.sendMail({
          from: '"Your Brand Name" <no-reply@yourbrand.com>',
          to: order.userId.email,
          subject: "Order Confirmation",
          text: `Your order for ${order.productId.name} has been successfully placed.`,
          html: `<p>Thank you for your purchase!</p>
                 <p><strong>Product:</strong> ${order.productId.name}</p>
                 <p><strong>Order ID:</strong> ${order.razorpayOrderId}</p>`,
        });
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
