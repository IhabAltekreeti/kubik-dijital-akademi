import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AIRequest {
  mode: "hint" | "explain" | "topic" | "similar_question" | "chat" | "teacher_class_analysis" | "parent_reply_draft";
  /** Öğretmen modları için hazırlanmış veri özeti */
  contextText?: string;
  grade?: number;
  subject?: string;
  topic?: string;
  questionText?: string;
  options?: string[];
  correctOptionIndex?: number;
  selectedOptionIndex?: number | null;
  explanation?: string;
  studentName?: string;
  userMessage?: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

const SYSTEM_PROMPT = `Sen Kubik Dijital Akademi'nin yapay zeka öğrenme asistanısın. Türk eğitim sistemine (LGS, YKS, okul dersleri) hakimsin.

GÖREVELERİN:
- Öğrencilere eğitim konusunda yardımcı olmak
- Soruları açıklamak, ipuçları vermek, konu anlatmak
- Öğrencinin sınıf seviyesine uygun içerik üretmek

KURALLAR:
- Türkçe yanıt ver
- İpucu modunda (hint) tam çözümü verme, yönlendirici sorular sor
- Açıklama modunda (explain) adım adım çöz
- Öğrencinin neden yanlış yaptığını tahmin etme, sadece factleri kullan
- Sınıf seviyesini aşma
- Eğitici, destekleyici ve nazik ol
- Matematiksel ifadeleri basit yaz, LaTeX kullanma`;

const TEACHER_SYSTEM_PROMPT = `Sen Kübik Dijital Akademi'nin öğretmen asistanısın. Bir dershane öğretmenine (LGS/YKS) şube verilerini yorumlamada ve velilerle iletişimde yardım ediyorsun.

KURALLAR:
- Türkçe, kısa ve uygulanabilir yaz
- Sadece verilen verileri kullan, sayı uydurma
- Öğrenciler hakkında yargılayıcı olma, çözüm odaklı ol
- Markdown başlıkları kullanma; düz paragraflar ve "- " ile başlayan maddeler kullan`;

function buildPrompt(req: AIRequest): string {
  const gradeText = req.grade ? `${req.grade}. sınıf seviyesinde` : "ortaokul/lise seviyesinde";
  const subjectText = req.subject ? `Ders: ${req.subject}` : "";
  const topicText = req.topic ? `Konu: ${req.topic}` : "";

  switch (req.mode) {
    case "hint": {
      return `${SYSTEM_PROMPT}

Aşağıdaki soru için bir İPUCU ver. Tam çözümü SAKIN verme. Öğrenciyi doğru cevaba yönlendirici bir ipucu veya soru sor.

Sınıf: ${gradeText}
${subjectText}
${topicText}

Soru: ${req.questionText}
Seçenekler: ${req.options?.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("\n")}

Öğrencinin seçtiği cevap: ${req.selectedOptionIndex !== null && req.selectedOptionIndex !== undefined ? String.fromCharCode(65 + req.selectedOptionIndex) : "Henüz seçmedi"}

Kısa, net bir ipucu ver (2-3 cümle).`;
    }
    case "explain": {
      return `${SYSTEM_PROMPT}

Aşağıdaki sorunun çözümünü adım adım açıkla.

Sınıf: ${gradeText}
${subjectText}
${topicText}

Soru: ${req.questionText}
Seçenekler: ${req.options?.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("\n")}
Doğru cevap: ${req.correctOptionIndex !== undefined ? String.fromCharCode(65 + req.correctOptionIndex) : "?"}
${req.selectedOptionIndex !== null && req.selectedOptionIndex !== undefined ? `Öğrencinin seçtiği: ${String.fromCharCode(65 + req.selectedOptionIndex)}` : ""}

Çözümü adım adım açıkla. Neden doğru cevabın doğru olduğunu ve diğer seçeneklerin neden yanlış olduğunu belirt.`;
    }
    case "topic": {
      return `${SYSTEM_PROMPT}

Aşağıdaki konu için ${gradeText} bir öğrenciye uygun özet bir anlatım yap.

${subjectText}
${topicText}

Konuyu 3-4 paragrafta açıkla. Önemli noktaları vurgula. Basit örnekler ver.`;
    }
    case "similar_question": {
      return `${SYSTEM_PROMPT}

Aşağıdaki soruya benzer, ${gradeText} seviyesinde yeni bir çoktan seçmeli soru üret.

${subjectText}
${topicText}

Orijinal soru: ${req.questionText}

Yanıtını SADECE aşağıdaki JSON formatında ver:
{
  "questionText": "Soru metni",
  "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
  "correctOptionIndex": 0,
  "explanation": "Çözüm açıklaması",
  "concept": "İlgili kavram"
}

JSON dışında hiçbir metin ekleme.`;
    }
    case "teacher_class_analysis": {
      return `${TEACHER_SYSTEM_PROMPT}

Aşağıdaki şube verilerine göre öğretmene haftalık bir şube analizi yaz.
1) 2-3 cümlelik genel değerlendirme
2) Sınıfın en çok zorlandığı konular ve neden önemli oldukları
3) Bireysel ilgi gereken öğrenciler (isimle)
4) Önümüzdeki hafta için 3-4 maddelik ders/etüt planı

ŞUBE VERİLERİ:
${req.contextText ?? ""}`;
    }
    case "parent_reply_draft": {
      return `${TEACHER_SYSTEM_PROMPT}

Bir veli öğretmene mesaj yazdı. Öğretmen adına nazik, samimi ama profesyonel, 4-6 cümlelik bir cevap taslağı yaz.
Veliye "Hanım"/"Bey" diye hitap et, öğrencinin verilerinden somut 1-2 bilgi ver, net bir öneri veya randevu teklifi ekle.
Sadece cevap metnini yaz, imza olarak "Ali Hoca" kullan.

ÖĞRENCİ VERİLERİ:
${req.contextText ?? ""}

VELİ MESAJI:
${req.userMessage ?? ""}`;
    }
    case "chat":
    default: {
      const historyText = req.chatHistory && req.chatHistory.length > 0
        ? req.chatHistory.map((m) => `${m.role === "user" ? "Öğrenci" : "Asistan"}: ${m.content}`).join("\n")
        : "";
      return `${SYSTEM_PROMPT}

${subjectText ? `Bağlam: ${subjectText}` : ""}
${topicText ? `Konu: ${topicText}` : ""}
${gradeText ? `Seviye: ${gradeText}` : ""}

${historyText}

Öğrencinin sorusu: ${req.userMessage}

Eğitici, destekleyici ve ${gradeText} uygun bir yanıt ver.`;
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Gemini API anahtarı yapılandırılmamış. Lütfen GEMINI_API_KEY secret'ını ayarlayın.",
        code: "NO_API_KEY",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: AIRequest = await req.json();

    // Verify auth via Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authHeader = req.headers.get("Authorization");

    // Ön yüz anon key ile istek atar; bu durumda kullanıcı doğrulaması atlanır (Supabase Auth henüz kullanılmıyor).
    const isAnonKey = authHeader === `Bearer ${supabaseAnonKey}`;
    if (supabaseUrl && supabaseAnonKey && authHeader && !isAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ error: "Yetkisiz erişim.", code: "UNAUTHORIZED" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const prompt = buildPrompt(body);
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            // 2.5 Flash'ta "düşünme" token'ları çıktı bütçesini yemesin
            ...(model.includes("2.5-flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      const errorMsg = geminiResponse.status === 429
        ? "AI servisi şu anda çok yoğun. Lütfen biraz sonra tekrar deneyin."
        : geminiResponse.status === 400
        ? "İstek formatında bir sorun var. Lütfen sorunuzu farklı şekilde sorun."
        : "AI servisine bağlanılamadı. Lütfen daha sonra tekrar deneyin.";
      return new Response(
        JSON.stringify({ error: errorMsg, code: "GEMINI_ERROR" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: "AI servisi boş yanıt döndürdü.", code: "EMPTY_RESPONSE" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For similar_question mode, try to parse JSON
    if (body.mode === "similar_question") {
      try {
        const jsonStart = generatedText.indexOf("{");
        const jsonEnd = generatedText.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = generatedText.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonStr);
          if (
            parsed.questionText &&
            Array.isArray(parsed.options) &&
            parsed.options.length >= 2 &&
            typeof parsed.correctOptionIndex === "number" &&
            parsed.correctOptionIndex >= 0 &&
            parsed.correctOptionIndex < parsed.options.length
          ) {
            return new Response(
              JSON.stringify({ question: parsed, raw: generatedText }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        return new Response(
          JSON.stringify({ error: "AI yanıtı geçerli bir soru formatında değil.", code: "INVALID_QUESTION" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ error: "AI yanıtı işlenemedi.", code: "PARSE_ERROR" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ content: generatedText, source: "gemini" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası oluştu.", code: "SERVER_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
