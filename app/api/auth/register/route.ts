import { connectToDataBase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and Password are required" },
        { status: 400 }
      );
    }

    await connectToDataBase();

    const user = await User.findOne({ email: email });

    if (user) {
      return NextResponse.json(
        { error: "This email already registered" },
        { status: 400 }
      );
    }

    await User.create({ email, password, role: "admin" });

    return NextResponse.json(
      { message: "user registered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("user not registered", error);
    return NextResponse.json({ error: "user not registered" }, { status: 400 });
  }
}
