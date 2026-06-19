import * as cheerio from 'cheerio';

const stripBoilerplate = (text: string): string =>
  text
    .replace(/Yukarıdaki açıklamalarımızın[\s\S]*$/, "")     // SPK beyanı
    .replace(/Kamuoyuna saygıyla duyurulur\.?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();


export const parseKapHtmlToMarkdown = (html: string): string => {
  const $ = cheerio.load(html);
  let markdown = "# KAP BİLDİRİM ANALİZİ\n\n";

  // Tüm veriyi barındıran ana tabloyu seçiyoruz
  const mainTable = $('table[class^="tbl_"]').first();

  if (mainTable && mainTable.length > 0) {
    markdown += handleTable($, mainTable);   // ✅ dönen değeri ekle
  } else {
    // ✅ Ana tablo yoksa: body'deki düz metne düş (boş kalmasın)
    const fallback = $('body').text().replace(/\s+/g, ' ').trim();
    markdown += fallback || "_İçerik ayrıştırılamadı._";
  }

  return stripBoilerplate(markdown.trim());   // ✅ EN ÖNEMLİSİ: return et!
};

const handleTable = ($: any, table: any): string => {
  let markdown = '';
  let currentSection = "Özet Bilgiler";
  markdown += `## ${currentSection}\n`;

  table.find('> tbody > tr').each((_: any, tr: any) => {
    const $tr = $(tr);

    // 1. Bölüm Başlıkları (KAP'taki yeşil barlar)
    const sectionHeader = $tr.find('.bgGreen .txtWhite').text().trim();
    if (sectionHeader) {
      currentSection = sectionHeader;
      markdown += `\n## ${currentSection}\n`;
      return;
    }

    const nestedTable = $tr.find('table');

    // 2. İç içe tablolar (verinin %90'ı burada)
    if (nestedTable.length > 0) {
      const isGrid = nestedTable.attr('border') === "1";

      if (isGrid) {
        // Dinamik Markdown tablosu
        let isFirstRow = true;
        nestedTable.find('tr').each((_: any, innerTr: any) => {
          const cells = $(innerTr).find('td, th');
          const rowData = cells
            .map((i: number, el: any) => $(el).text().trim().replace(/\s+/g, ' '))
            .get();

          if (rowData.join('').trim() !== '') {
            markdown += `| ${rowData.join(' | ')} |\n`;
            if (isFirstRow) {
              markdown += `|${rowData.map(() => '---').join('|')}|\n`;
              isFirstRow = false;
            }
          }
        });
        markdown += "\n";
      } else {
        // 2 kolonlu Key-Value tablosu
        nestedTable.find('tr').each((_: any, innerTr: any) => {
          const cells = $(innerTr).find('td');
          if (cells.length === 2) {
            const key = $(cells[0]).text().trim().replace(/:$/, '');
            const value = $(cells[1]).text().trim();
            if (key && value && value !== "--" && value !== "-") {
              markdown += `- **${key}:** ${value}\n`;
            }
          }
        });
      }
    } else {
      // 3. Tablosuz düz metin (Ek Açıklamalar gibi)
      const textContent = $tr.find('.gwt-HTML').text().trim();
      if (textContent && textContent.length > 20) {
        markdown += `${textContent}\n\n`;
      }
    }
  });

  return markdown;   // ✅ handleTable zaten return ediyordu, artık yakalanıyor
};