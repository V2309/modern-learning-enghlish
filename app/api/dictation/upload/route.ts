import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user.service";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/dictation-audio",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error uploading audio to ImageKit:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
