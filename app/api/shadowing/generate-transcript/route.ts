import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

/** Convert seconds to LRC timestamp: [mm:ss.xx] */
function toTimestamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `[${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}]`;
}

/** Decode HTML entities */
function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl là bắt buộc' }, { status: 400 });
    }

    // youtube-transcript accepts full URLs or video IDs
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl, {
        lang: 'en',
      });
    } catch {
      // Fallback: try without language preference (some videos only have auto-generated in other langs)
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
      } catch (err2: unknown) {
        const msg = err2 instanceof Error ? err2.message : String(err2);

        if (msg.includes('disabled') || msg.includes('No transcript')) {
          return NextResponse.json({
            error:
              'Video này không có phụ đề. Vui lòng chọn video khác hoặc nhập phụ đề thủ công.',
          }, { status: 404 });
        }

        return NextResponse.json({
          error: `Không thể lấy phụ đề: ${msg}`,
        }, { status: 500 });
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json({
        error: 'Video này không có phụ đề. Vui lòng chọn video khác hoặc nhập phụ đề thủ công.',
      }, { status: 404 });
    }

    // Convert to LRC format
    const lrc = transcriptItems
      .map((item) => {
        const startSec = item.offset / 1000; // offset is in ms
        const text = decodeHtml(item.text);
        return `${toTimestamp(startSec)} ${text}`;
      })
      .filter((line) => line.trim().length > 0)
      .join('\n');

    return NextResponse.json({
      transcript: lrc,
      lineCount: transcriptItems.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate transcript error:', error);
    return NextResponse.json({ error: `Lỗi server: ${message}` }, { status: 500 });
  }
}
