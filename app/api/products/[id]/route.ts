import { connectToDataBase } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectToDataBase();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
