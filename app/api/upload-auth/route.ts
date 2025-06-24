import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  
  try {
    const { token, signature, expire } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    });

    return Response.json({
      token,
      signature,
      expire,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Authentication for Imagekit failed",
      },
      { status: 500 }
    );
  }
}
