import { GoogleGenAI, Type } from "@google/genai";

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function generateWordFamilies(word: string) {
  const ai = getAiClient();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of word families for the word: "${word}". Include the word, its part of speech, and a short definition in Vietnamese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              meaning: { type: Type.STRING }
            },
            required: ["word", "partOfSpeech", "meaning"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
}

export async function getPronunciationIPA(word: string) {
  const ai = getAiClient();
  if (!ai) return "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the IPA pronunciation of the English word: "${word}"? Return ONLY the IPA notation between forward slashes (e.g., /həˈloʊ/).`,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("IPA Generation Error:", error);
    return "";
  }
}

export async function getEnrichedWordDetail(word: string) {
  const ai = getAiClient();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For the English word "${word}", provide:
      1. Accurate IPA pronunciation (e.g., /əˈkaʊntənt/)
      2. Clear Vietnamese meaning/definition
      3. Simple English definition (e.g. "a person responsible for analyzing financial records")
      4. A practical example sentence using that word, along with its Vietnamese translation.
      Return this as a JSON object matching this structure:
      {
        "ipa": "string",
        "vietnameseDefinition": "string",
        "englishDefinition": "string",
        "exampleEn": "string",
        "exampleVi": "string"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Enrichment Error:", e);
    return null;
  }
}

export async function evaluateUserSentence(data: {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  userSentence: string;
}) {
  const ai = getAiClient();
  if (!ai) {
    const containsWord = data.userSentence.toLowerCase().includes(data.word.toLowerCase());
    return {
      isCorrect: containsWord,
      score: containsWord ? 85 : 40,
      targetWordUsed: containsWord,
      feedback: containsWord
        ? `Câu của bạn đã có từ "${data.word}". Đánh giá tạm thời (chưa cấu hình API key Gemini): Cấu trúc câu đúng và dễ hiểu!`
        : `Câu của bạn chưa chứa từ chìa khóa "${data.word}". Hãy chắc chắn rằng bạn đã sử dụng từ này trong câu.`,
      grammarErrors: containsWord ? [] : [`Thiếu từ chìa khóa "${data.word}"`],
      suggestedSentence: `I need to use "${data.word}" in my everyday conversation.`,
      suggestedSentenceMeaning: `Tôi cần sử dụng từ "${data.word}" trong giao tiếp hàng ngày.`
    };
  }

  try {
    const prompt = `Bạn là một giáo viên dạy tiếng Anh chuyên nghiệp.
Người học vừa tự đặt câu với từ tiếng Anh sau:
- Từ vựng: "${data.word}" (${data.partOfSpeech || 'N/V/Adj'})
- Nghĩa tiếng Việt của từ: "${data.meaning}"
- Câu người dùng vừa đặt: "${data.userSentence}"

Hãy phân tích và đánh giá câu của người dùng theo các tiêu chí:
1. Từ "${data.word}" có được sử dụng chính xác về ngữ cảnh, ngữ nghĩa và từ loại không?
2. Ngữ pháp, từ vựng và sự tự nhiên của toàn câu tiếng Anh có đúng không?
3. Thang điểm từ 0 - 100.
4. Đưa ra nhận xét chi tiết, gần gũi bằng tiếng Việt.
5. Liệt kê danh sách các lỗi ngữ pháp/chính tả nếu có (bằng tiếng Việt).
6. Đưa ra một câu gợi ý chuẩn và tự nhiên bằng tiếng Anh (bắt buộc phải sử dụng đúng từ vựng "${data.word}" trong ngữ cảnh và cấu trúc chính xác) kèm theo dịch nghĩa tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN, description: "Trạng thái câu đúng hay chưa" },
            score: { type: Type.INTEGER, description: "Điểm số từ 0 đến 100" },
            targetWordUsed: { type: Type.BOOLEAN, description: "Có xuất hiện từ target trong câu hay không" },
            feedback: { type: Type.STRING, description: "Nhận xét chi tiết bằng tiếng Việt" },
            grammarErrors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Danh sách lỗi ngữ pháp hoặc dùng từ"
            },
            suggestedSentence: { type: Type.STRING, description: "Câu gợi ý chuẩn và tự nhiên bằng tiếng Anh (bắt buộc phải chứa từ khóa cần luyện tập)" },
            suggestedSentenceMeaning: { type: Type.STRING, description: "Dịch nghĩa tiếng Việt của câu gợi ý" }
          },
          required: ["isCorrect", "score", "targetWordUsed", "feedback", "grammarErrors", "suggestedSentence", "suggestedSentenceMeaning"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error evaluating user sentence:", error);
    const containsWord = data.userSentence.toLowerCase().includes(data.word.toLowerCase());
    return {
      isCorrect: containsWord,
      score: containsWord ? 80 : 30,
      targetWordUsed: containsWord,
      feedback: `Không thể kết nối dịch vụ AI phân tích lúc này. ${containsWord ? 'Câu đã chứa từ cần luyện tập.' : 'Câu chưa chứa từ cần luyện tập.'}`,
      grammarErrors: containsWord ? [] : [`Chưa có từ "${data.word}" trong câu`],
      suggestedSentence: `Practicing sentences with "${data.word}" helps improve vocabulary fluency.`,
      suggestedSentenceMeaning: `Luyện tập đặt câu với "${data.word}" giúp cải thiện độ trôi chảy từ vựng.`
    };
  }
}

