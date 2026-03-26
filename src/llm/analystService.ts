import ollama from 'ollama';
// Bir önceki adımda yazdığımız HTML temizleyici fonksiyonunu içe aktarıyoruz

const SYSTEM_PROMPT = `
Sen uzman bir finansal analist ve duygu analizi algoritmasısın. 
Görevin, sana verilen Kamuoyu Aydınlatma Platformu (KAP) bildirimini analiz etmek ve hisse senedi üzerindeki kısa vadeli etkisini 1 ile 10 arasında puanlamaktır.

Puanlama Kriterleri:
- 1-3: Son derece olumsuz (Örn: İflas, zarar, dava, borç temerrüdü). Düşüş beklentisi.
- 4-6: Nötr veya rutin işlemler (Örn: Rutin borç ödemesi, olağan genel kurul). Etkisiz.
- 7-10: Son derece olumlu (Örn: Büyük ihale, yüksek kar, temettü). Yükseliş beklentisi.

KURALLAR:
1. Asla yatırım tavsiyesi verme.
2. SADECE VE SADECE aşağıdaki JSON formatında yanıt ver. Başka hiçbir kelime ekleme!

İstenen JSON Formatı:
{
  "score": <1-10 arası sayı>,
  "trend": "<YÜKSELİŞ, DÜŞÜŞ veya NÖTR>",
  "short_analysis": "<Puanın nedenini açıklayan maksimum 2 cümlelik net finansal gerekçe>",
  "long_analysis": "<Puanın nedenini açıklayan ve daha iyi puanlama için gerekebilecek verileri söyleyen 25-30 cümle arası net finansal gerekçe>"
}
`;

export const analyzeKapNotification = async (parsedText: string) => {
    try {
        console.log("1. HTML verisi Markdown'a çevriliyor...");

        console.log("2. LLM Analizi başlatılıyor (Llama 3.1)...");
        
        // Ollama'ya istek atıyoruz
        const response = await ollama.chat({
            // model: 'llama3.1:8b-instruct-q8_0', // Bilgisayarında yüklü olan modelin adı
            model: "llama3.1",
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `İşte analiz etmen gereken KAP bildirimi:\n\n${parsedText}` }
            ],
            format: 'json', // EN KRİTİK NOKTA: Modelin sadece JSON dönmesini zorlar
            keep_alive: "1h",
            options: {
                temperature: 0.1 // 0'a yakın olması, modelin daha analitik ve kurallara bağlı olmasını sağlar
            }
        });

        // Gelen string halindeki JSON yanıtını JavaScript objesine çeviriyoruz
        const aiResult = JSON.parse(response.message.content);
        
        console.log("3. Analiz Tamamlandı!");
        console.log(aiResult)
        return aiResult;

    } catch (error) {
        console.error("LLM Analiz Servisinde Hata:", error);
        // Burada daha önce yazdığın ErrorRequestHandler yapısına uygun bir hata fırlatabilirsin
        throw new Error("KAP Bildirimi yapay zeka tarafından analiz edilemedi.");
    }
};