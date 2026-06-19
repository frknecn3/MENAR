import ollama from "ollama";
import { z } from "zod";

const MODEL = "gemma3:4b";

// Tek kaynaktan şema (hem doğrulama hem tip)
export const AnalysisSchema = z.object({
    score: z.number().int().min(1).max(10),
    trend: z.enum(["YÜKSELİŞ", "DÜŞÜŞ", "NÖTR"]),
    key_facts: z.array(z.string()).min(1),     // ✅ somut veriler
    short_analysis: z.string().min(1),
    long_analysis: z.string().min(1),
}).refine(
    (d) =>
        (d.score <= 3 && d.trend === "DÜŞÜŞ") ||
        (d.score >= 7 && d.trend === "YÜKSELİŞ") ||
        (d.score >= 4 && d.score <= 6 && d.trend === "NÖTR"),
    { message: "score ile trend tutarsız" }
);
export type KapAnalysis = z.infer<typeof AnalysisSchema>;

// Ollama'nın modeli zorlaması için JSON Schema
const responseFormat = {
    type: "object",
    properties: {
        score: { type: "integer", minimum: 1, maximum: 10 },
        trend: { type: "string", enum: ["YÜKSELİŞ", "DÜŞÜŞ", "NÖTR"] },
        short_analysis: { type: "string" },
        long_analysis: { type: "string" },
    },
    required: ["score", "trend", "short_analysis", "long_analysis"],
} as const;

const SYSTEM_PROMPT = `Sen uzman bir finansal analist ve duygu analizi algoritmasısın.
Görevin, verilen KAP bildirimini analiz edip hisse üzerindeki kısa vadeli etkisini 1-10 arası puanlamaktır.

ÇALIŞMA İLKELERİ:
- SADECE bildirimde AÇIKÇA geçen bilgileri kullan. Metinde olmayan hiçbir şey ekleme, yorum uydurma.
- Bildirimdeki SOMUT VERİLERİ (tutar, adet, tarih, kurum, oran) mutlaka analizine dahil et.
- Bir kavramdan emin değilsen kesin dille ("eminlerdir" gibi) yazma.

PUANLAMA:
- 1-3: Olumsuz (iflas, zarar, dava, temerrüt) → DÜŞÜŞ
- 4-6: Nötr/rutin (olağan genel kurul, rutin ödeme) → NÖTR
- 7-10: Olumlu (büyük ihale, yüksek kâr, temettü, büyüme yatırımı) → YÜKSELİŞ
- Büyüme yatırımlarında hem fırsatı (yeni gelir) hem riski (borç/teminat yükü) tart ve skoru buna göre ver.

KURALLAR:
1. Asla yatırım tavsiyesi verme.
2. "trend" değeri skorla tutarlı olmalı (1-3→DÜŞÜŞ, 4-6→NÖTR, 7-10→YÜKSELİŞ).
3. "short_analysis" EN FAZLA 2 cümle. "long_analysis" daha kapsamlı ve farklı olmalı.
4. "key_facts" bildirimden çıkardığın somut verilerin kısa listesi olsun.`;

export const analyzeKapNotification = async (
    parsedText: string
): Promise<KapAnalysis> => {
    if (!parsedText || parsedText.trim().length === 0) {
        throw new Error("Analiz edilecek bildirim metni boş.");
    }

    console.log(`LLM analizi başlatılıyor (${MODEL})...`);

    let rawContent = "";
    try {
        const response = await ollama.chat({
            model: MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `İşte analiz etmen gereken KAP bildirimi:\n\n${parsedText}`,
                },
            ],
            format: responseFormat, // JSON Schema => güvenilir çıktı
            keep_alive: "1h",
            options: {
                temperature: 0.1,
                num_predict: 2048, // yarıda kesilmeyi önler
            },
            think: false
        });

        rawContent = response.message.content.trim();

        const parsed = AnalysisSchema.safeParse(JSON.parse(rawContent));
        if (parsed.success) return parsed.data;

        // Model başına/sonuna karakter eklerse temizle ve tekrar dene
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (match) {
            const retry = AnalysisSchema.safeParse(JSON.parse(match[0]));
            if (retry.success) return retry.data;
        }

        console.error("AI çıktısı şemaya uymadı:", rawContent);
        throw new Error("Yapay zeka çıktısı beklenen formata uymuyor.");
    } catch (error) {
        console.error("LLM Analiz Servisinde Hata:", error, "\nHam çıktı:", rawContent);
        throw new Error("KAP bildirimi yapay zeka tarafından analiz edilemedi.");
    }
};