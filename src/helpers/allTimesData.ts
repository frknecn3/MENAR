import fs from 'fs';
import path from 'path';

const DATA_DIR = './data/';
const OUTPUT_FILE = './data/bist100_all_times.json';

// PDF'ten gelen kirli sayıları temizleyip gerçek float/int'e çeviren yardımcı fonksiyon
const parseNumericValue = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;

    // "92.7", "1,5", "86.05" gibi string ifadeleri temizle
    const cleaned = String(val).replace(/,/g, '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
};

// İçinde birden fazla sayı olan (örn: "28.5 54.1") bozuk satırları parçalayan fonksiyon
const splitMergedCell = (val: any) => {
    if (typeof val !== 'string') return [val];
    const parts = val.split(' ').filter(p => p.trim() !== '');
    return parts.length > 0 ? parts : [val];
};

const combineDataForAllTimes = () => {
    try {
        // Hedef veri yapımız: { "AEFES": [ { date, deger_skoru, ... }, ... ], "AKBNK": [ ... ] }
        const timelineData: any = {};
        let processedFilesCount = 0;

        // İlgili dosyaları bul
        const files = fs.readdirSync(DATA_DIR)
            .filter((file) => file.startsWith('financial') && file.endsWith('.json'));

        console.log(`Toplam ${files.length} dosya işlenecek...`);

        // Senkron dosya okuma (for...of) en güvenlisidir çünkü RAM'i şişirmez
        for (const file of files) {
            const filePath = path.join(DATA_DIR, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            let jsonData;

            try {
                jsonData = JSON.parse(fileContent);
            } catch (e) {
                console.error(`⚠️ JSON okuma hatası (${file}): Atlanıyor...`);
                continue;
            }

            // Dosyanın tarihini al. Eğer report_date null ise captured_at kullan.
            const reportDate = jsonData.report_date || jsonData.captured_at;
            if (!reportDate || !jsonData.records || !Array.isArray(jsonData.records)) {
                continue;
            }

            // Her bir şirket kaydını dön
            for (const record of jsonData.records) {
                const rawCode = record.kod || "";

                // HATA TESPİTİ: Eğer 'kod' içinde boşluk varsa (örn: "EGEEN EKGYO") bu satır birleşmiştir.
                const companyCodes = splitMergedCell(rawCode);

                // Diyelim ki 2 şirket birleşti, o zaman diğer sütunlarda da 2'şer değer vardır.
                // Bu değerleri bulup şirketlere dağıtacağız.
                companyCodes.forEach((code, index) => {
                    const cleanCode: string = code.trim().toUpperCase();
                    if (!cleanCode || cleanCode.length < 3) return; // Geçersiz kodları atla

                    // Şirket için dizi yoksa oluştur
                    if (!timelineData[cleanCode]) {
                        timelineData[cleanCode] = [];
                    }

                    // Sütun kaymalarını engellemek için tüm value'ları tek bir array'de toplayıp 
                    // sırasıyla anlamlandırmak en güvenli yoldur (PDF sütunlarına güvenemeyiz)

                    // Object.values() ile tüm hücre değerlerini alıyoruz, boş olanları atıyoruz.
                    const allCellValues = Object.values(record).filter(v => v !== "" && v !== null);

                    // Şirketin indeksine (0 veya 1) göre o hücredeki doğru değeri çekiyoruz
                    const getSafeValue = (valIndex: any) => {
                        // Eğer ilk baştaki "kod" hücresini (index 0) atlarsak, sıradaki değerler skorlardır
                        const cell = allCellValues[valIndex + 1];
                        if (!cell) return null;
                        const splitVals = splitMergedCell(cell);
                        return parseNumericValue(splitVals[index] !== undefined ? splitVals[index] : splitVals[0]);
                    };

                    // Temizlenmiş ve standardize edilmiş veri objesi
                    const standardizedRecord = {
                        date: reportDate,
                        deger_skoru: getSafeValue(0),
                        karlilik_skoru: getSafeValue(1),
                        buyume_skoru: getSafeValue(2),
                        momentum_skoru: getSafeValue(3),
                        quant_skoru: getSafeValue(4),
                        piotroski_f_skoru: getSafeValue(5),
                        magic_formula: getSafeValue(6),
                        // Hangi dosyadan geldiğini loglamak istersen:
                        // source_file: file 
                    };

                    timelineData[cleanCode].push(standardizedRecord);
                });
            }
            processedFilesCount++;
        }

        // Elde edilen tüm veriyi kronolojik olarak (tarihe göre) sırala
        for (const company in timelineData) {
            timelineData[company].sort((a: { date: string }, b: { date: string }) => {
                // .getTime() tarihleri milisaniye cinsinden sayıya (number) çevirir, TypeScript mutlu olur.
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
        }

        // Sonucu yeni bir JSON dosyasına yaz
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(timelineData, null, 2), 'utf-8');

        console.log(`✅ İşlem tamamlandı! ${processedFilesCount} dosya birleştirildi.`);
        console.log(`📊 Toplam ${Object.keys(timelineData).length} farklı şirketin zaman çizelgesi oluşturuldu.`);
        console.log(`📁 Çıktı: ${OUTPUT_FILE}`);

    } catch (err) {
        console.error("Kritik Hata:", err);
    }
};

combineDataForAllTimes();