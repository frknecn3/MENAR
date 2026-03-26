import * as cheerio from 'cheerio';
import { AppError } from '../middlewares/globalErrorHandler';

export const parseKapHtmlToMarkdown = (html: string): string => {
    const $ = cheerio.load(html);
    let markdown = "# KAP BİLDİRİM ANALİZİ\n\n";

    // Tüm veriyi barındıran ana tabloyu seçiyoruz
    const mainTable = $('table[class^="tbl_"]').first();

    if (mainTable.length === 0) {
        throw new AppError("Hata: Desteklenmeyen bildirim formatı. KAP tablosu bulunamadı.", 404);
    }

    let currentSection = "Özet Bilgiler";
    markdown += `## ${currentSection}\n`;

    // Ana tablonun ana satırlarını (tr) tek tek dönüyoruz
    mainTable.find('> tbody > tr').each((_, tr) => {
        const $tr = $(tr);

        // 1. Bölüm Başlıklarını Yakalama (KAP'taki yeşil barlar)
        const sectionHeader = $tr.find('.bgGreen .txtWhite').text().trim();
        if (sectionHeader) {
            currentSection = sectionHeader;
            markdown += `\n## ${currentSection}\n`;
            return; // Başlığı ekledik, sonraki satıra geç
        }

        const nestedTable = $tr.find('table');

        // 2. İç İçe Tabloları İşleme (Verilerin %90'ı buradadır)
        if (nestedTable.length > 0) {
            // KAP'ta grid tablolar (İtfa planı gibi) genelde border="1" ile gelir
            const isGrid = nestedTable.attr('border') === "1";

            if (isGrid) {
                // Dinamik Markdown Tablosu Oluşturucu
                let isFirstRow = true;
                nestedTable.find('tr').each((_, innerTr) => {
                    const cells = $(innerTr).find('td, th');

                    // Hücre içindeki enter (\n) karakterlerini boşlukla değiştiriyoruz ki MD tablosu kırılmasın
                    const rowData = cells.map((i, el) => $(el).text().trim().replace(/\s+/g, ' ')).get();

                    // Sadece içi boş olmayan satırları ekle
                    if (rowData.join('').trim() !== '') {
                        markdown += `| ${rowData.join(' | ')} |\n`;

                        // Başlığın hemen altına Markdown ayraçlarını (---|---) ekle
                        if (isFirstRow) {
                            markdown += `|${rowData.map(() => '---').join('|')}|\n`;
                            isFirstRow = false;
                        }
                    }
                });
                markdown += "\n";
            } else {
                // 2 Kolonlu Key-Value Tablosu (Örn: Para Birimi: TRY)
                nestedTable.find('tr').each((_, innerTr) => {
                    const cells = $(innerTr).find('td');
                    if (cells.length === 2) {
                        const key = $(cells[0]).text().trim().replace(/:$/, ''); // Sonda iki nokta varsa temizle
                        const value = $(cells[1]).text().trim();

                        // Boş, anlamsız veya "--" gibi verileri modele gönderip kalabalık yapma
                        if (key && value && value !== "--" && value !== "-") {
                            markdown += `- **${key}:** ${value}\n`;
                        }
                    }
                });
            }
        } else {
            // 3. Tablosuz Düz Metin İşleme (Örn: Ek Açıklamalar altındaki upuzun yazılar)
            const textContent = $tr.find('.gwt-HTML').text().trim();
            // Çok kısa metinleri ("Evet", "Hayır" vb.) atlayıp sadece uzun açıklamaları al
            if (textContent && textContent.length > 20) {
                markdown += `${textContent}\n\n`;
            }
        }
    });


    return markdown;
};