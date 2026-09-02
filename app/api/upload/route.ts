import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user.service";
import { uploadFileToImageKit } from "@/lib/imagekit";

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Vui lòng đăng nhập." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/vocabulary-images";

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file để upload" }, { status: 400 });
    }

    const isAudio =
      folder.includes("audio") ||
      folder.includes("dictation") ||
      file.type.startsWith("audio/");

    // Validate based on media type
    if (isAudio) {
      if (file.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          { error: "Kích thước file audio vượt quá giới hạn cho phép (tối đa 25MB)" },
          { status: 400 }
        );
      }
      if (file.type && !ALLOWED_AUDIO_TYPES.includes(file.type) && !file.type.startsWith("audio/")) {
        return NextResponse.json(
          { error: "Định dạng audio không được hỗ trợ (chấp nhận MP3, WAV, AAC, M4A, OGG, WebM)." },
          { status: 400 }
        );
      }
    } else {
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Kích thước file ảnh vượt quá giới hạn cho phép (tối đa 10MB)" },
          { status: 400 }
        );
      }
      if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Định dạng file không hỗ trợ. Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF, SVG, AVIF)." },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Clean file name with timestamp prefix
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const result = await uploadFileToImageKit({
      file: buffer,
      fileName: cleanFileName,
      folder,
      tags: [folder.replace(/[^a-zA-Z0-9_-]/g, ""), user.uid],
    });

    return NextResponse.json({
      ...result,
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl || result.url,
    });
  } catch (error: any) {
    console.error("Error uploading to ImageKit:", error);
    return NextResponse.json(
      { error: error.message || "Upload file thất bại. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
