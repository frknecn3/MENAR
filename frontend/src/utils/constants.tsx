export const unwanted = [
    // Riba / Faiz
    "faiz", "akdi faiz", "gecikme faizi", "gecikme zammı", "gecikme bedeli",
    "vade farkı", "nakit avans", "ek hesap kredisi", "kredi kartı",
    "rotatif kredi", "yüksek faizli kredi", "faiz işletimli", "kupon faizi",
    "değişken faizli", "vadeli mevduat", "mevduat faizi", "repo", "gecelik repo",
    "garantili faiz getirili fon", "sabit faizli devlet tahvili", "tahvil",
    "tahvil ihracı", "borçlanma senedi ihracı", "faiz takası", "swap",

    // Maysir / Kumar
    "bahis", "canlı bahis", "bahis kuponu", "bonus", "çevrim şartlı bonus",
    "kayıp iadesi", "çekiliş", "slot", "slot turnuvası", "jackpot",
    "kazı-kazan", "piyango", "casino", "kumarhane", "şans oyunu",

    // Garar / Spekülasyon
    "spekülasyon", "spekülatif", "spekülatif pozisyon", "kaldıraç",
    "kaldıraç oranı", "kaldıraçlı işlem", "vadeli işlem", "futures",
    "açığa satış", "short", "opsiyon", "put pozisyonu", "forward",
    "türev işlem", "marjin hesabı", "yüksek volatilite",

    // Konvansiyonel sigorta
    "hayat sigortası", "birikimli emeklilik", "iştira bedeli",

    // Haram sektörler
    "bira", "şarap", "alkol", "tütün", "kumarhane işletmeciliği",
]

export const texts = [
  // 1 — Banka kamuoyu duyurusu (faiz/riba, gecikme faizi, kredi kartı)
  `Bankamız, bireysel kredi kartı ürünlerine ilişkin güncel uygulama esaslarını kamuoyunun bilgisine sunar. Asgari ödeme tutarının son ödeme tarihinde tahsil edilememesi hâlinde, kalan borç bakiyesine sözleşmede belirtilen oranda akdi faiz ve gecikme faizi tahakkuk ettirilecektir. Müşterilerimizin nakit ihtiyaçlarını karşılamak amacıyla, belirli bir dönem faizsiz tanıtılan, sonrasında aylık faiz oranıyla işleyen ek hesap kredisi ve kredi kartı nakit avans imkânı sunulmaya devam edecektir. Güncel akdi faiz, gecikme faizi ve nakit avans oranları resmi internet sitemizde ilan edilmektedir. İşbu duyuru, müşterilerimizin bilgilendirilmesi ve şeffaflık ilkesi gereği yayımlanmış olup tüm ilgililere saygıyla arz olunur.`,

  // 3 — Sigorta şirketi kamuoyu duyurusu (konvansiyonel sigorta, faizli prim)
  `Sigorta şirketimiz, hayat sigortası ve birikimli bireysel emeklilik ürünlerinin yenileme esaslarını kamuoyunun bilgisine sunar. Poliçe yenileme primleri, garantili faiz getirili birikim fonlarının dönemsel performansı ve güncel teknik faiz oranları dikkate alınarak yeniden hesaplanmaktadır. Poliçenin vadesinden önce sonlandırılması durumunda, biriken tutar üzerinden iştira bedeli kesintisi uygulanacaktır. Birikimlerin öncelikli olarak sabit faizli devlet tahvili ve özel sektör tahvili ağırlıklı fonlarda değerlendirilmesine devam edilecek, böylece piyasa dalgalanmalarına karşı sabit getiri korunacaktır. Poliçe sahiplerimizin yenileme, prim ödeme planı ve fon dağılımı konularında yetkili acentelerimizle iletişime geçmeleri rica olunur. İşbu duyuru, şeffaflık ilkesi gereği kamuoyunun bilgisine saygıyla sunulur.`,

  // 4 — Kripto varlık platformu kamuoyu duyurusu (spekülasyon, kaldıraç, futures, garar)
  `Kripto varlık işlem platformumuz, yeni dönemde devreye alınan ürün ve hizmetleri kamuoyunun bilgisine sunar. Bu kapsamda, yüksek kaldıraç oranlarıyla vadeli işlem yani futures imkânı sunulacak, açığa satış pozisyonlarıyla yatırımcıların düşen piyasalarda da işlem yapabilmesi sağlanacaktır. Yüksek volatiliteye sahip yeni token listelemeleri, opsiyon stratejileri ve marjin hesabı üzerinden kaldıraçlı işlem seçenekleri aktif hâle getirilecektir. Faizli stake havuzlarında varlıkların kilitlenmesi karşılığında dönemsel getiri tahakkuk ettirilecektir. Kaldıraçlı ve spekülatif işlemlerin yüksek risk taşıdığı, anapara kaybına yol açabileceği önemle hatırlatılır. İşbu duyuru, kullanıcıların bilgilendirilmesi ve risklerin şeffaf biçimde paylaşılması amacıyla yayımlanmış olup kamuoyuna saygıyla arz olunur.`,

  // 5 — Perakende şirketi kamuoyu duyurusu (vade farkı/faiz, gecikme zammı)
  `Şirketimiz, yaz dönemi satış kampanyasının uygulama esaslarını kamuoyunun bilgisine sunar. Seçili beyaz eşya, televizyon ve elektronik ürünlerde on iki aya varan taksit imkânı sağlanacaktır. Anlaşmalı bankaların kredi kartlarına yönelik ek taksit seçeneklerinde, peşin fiyata vade farkı ve faiz oranı yansıtılacaktır. Senetli satışlarda ürün bedeli, vade süresine göre belirlenen vade farkı eklenerek taksitlendirilecek; ödemelerin gecikmesi hâlinde kalan borç tutarına günlük gecikme zammı tahakkuk ettirilecektir. Ayrıca anlaşmalı tüketici finansman kuruluşu aracılığıyla düşük faizli ihtiyaç kredisi seçeneği sunulacaktır. Kampanya koşullarının stoklarla sınırlı olduğu hatırlatılır. İşbu duyuru, tüketicilerin bilgilendirilmesi amacıyla yayımlanmış olup kamuoyuna saygıyla duyurulur.`,

  // 6 — KAP tarzı kurumsal kamuoyu aydınlatma duyurusu (tahvil/faiz, türev, kaldıraç)
  `Şirketimiz, lojistik filo yatırımlarının finansmanı amacıyla gerçekleştirdiği işlemleri Kamuyu Aydınlatma Platformu üzerinden yatırımcıların bilgisine sunar. Bu kapsamda, nitelikli yatırımcılara yönelik kupon faizli özel sektör tahvili ihraç edilmiştir. Söz konusu borçlanma aracı değişken faizli olup gösterge tahvil getirisine endekslidir ve faiz ödemeleri üç ayda bir gerçekleştirilecektir. Döviz kuru ve faiz oranı risklerinden korunmak amacıyla forward, swap ve faiz takası sözleşmeleri yapılmış, koruma amaçlı opsiyon işlemleri devreye alınmıştır. Bu işlemler neticesinde bilançodaki kaldıraç oranı yükseltilmiştir. Şirketimiz ayrıca bankalarla rotatif kredi anlaşmaları imzalamıştır. İşbu açıklama, şeffaflık ilkesi gereği kamuoyunun ve düzenleyici kurumların bilgisine saygıyla sunulur.`,

  // 7 — Portföy yönetim şirketi kamuoyu duyurusu (spekülasyon, açığa satış, opsiyon, garar)
  `Portföy yönetim şirketimiz, dönemsel yatırım stratejisini katılımcıların bilgisine sunar. Bu dönemde volatilitesi yüksek hisse senetlerinde kısa vadeli alım satım pozisyonlarına ağırlık verilecek, düşüş beklenen kıymetlerde açığa satış ve put opsiyonu stratejileri uygulanacaktır. Marjin hesapları üzerinden kaldıraçlı pozisyonlar açılabilecek, emtia piyasalarında vadeli işlem sözleşmeleriyle spekülatif pozisyonlar değerlendirilecektir. Yüksek getiri hedefiyle yürütülen bu işlemlerin yüksek risk taşıdığı, anapara kaybı ihtimali bulunduğu önemle hatırlatılır. Katılımcıların risk profillerine uygun hareket etmeleri ve sermayelerinin tamamını tek bir spekülatif pozisyona bağlamamaları tavsiye olunur. İşbu duyuru, yatırımcıların bilgilendirilmesi ve risklerin şeffaf biçimde paylaşılması amacıyla yayımlanmış olup kamuoyuna saygıyla arz olunur.`,

  // 8 — Banka mevduat kampanyası kamuoyu duyurusu (riba/faiz, vadeli mevduat)
  `Bankamız, mevduat ürünlerine ilişkin yeni dönem kampanya koşullarını kamuoyunun bilgisine sunar. Bu kapsamda, otuz iki günlük vadeli mevduat hesaplarına belirli bir tutara kadar net yıllık faiz oranı uygulanacaktır. Müşterilerimiz, e-devlet veya mobil bankacılık kanalları üzerinden hesap açabilecek; vadeli mevduat veya gecelik repo ürünleri aracılığıyla birikimlerine faiz tahakkuk ettirebilecektir. Vade sonunda elde edilen faiz getirisi anaparaya eklenecek ve sonraki vadede bileşik biçimde değerlenecektir. Düzenli birikim yapan müşterilere ek faiz puanı tanımlanacaktır. Kampanyanın belirtilen tarihe kadar geçerli olduğu hatırlatılır. İşbu duyuru, müşterilerimizin bilgilendirilmesi amacıyla yayımlanmış olup kamuoyuna saygıyla duyurulur.`,

  // 9 — Şans oyunu / çekiliş düzenleyicisi kamuoyu duyurusu (kumar/maysir)
  `Şirketimiz, düzenleyeceği büyük ödüllü çekiliş kampanyasını kamuoyunun bilgisine sunar. Bu kapsamda, mağazalarımızdan veya internet sitemizden yapılan her yüz liralık alışveriş karşılığında bir çekiliş hakkı tanımlanacaktır. Kampanya sonunda belirlenecek talihliye nakit büyük ikramiye verilecek; ayrıca günlük kazı kazan uygulamalarıyla çeşitli sürpriz hediyeler dağıtılacaktır. Biriktirilen bilet sayısı arttıkça kazanma şansının yükseleceği, katılımcıların biletlerini birleştirerek ikramiye havuzundaki paylarını artırabilecekleri belirtilir. Çekilişe katılımın ücretsiz olduğu ve sonuçların noter huzurunda açıklanacağı, on sekiz yaş altı bireylerin katılamayacağı önemle hatırlatılır. İşbu duyuru, katılımcıların bilgilendirilmesi amacıyla yayımlanmış olup kamuoyuna saygıyla duyurulur.`,

  // 10 — "Uygun gibi görünen" gizli yasaklı unsur içeren kamuoyu duyurusu (zor vaka)
  `Finans kuruluşumuz, katılım finansı esaslarına dayalı ürün ve hizmetlerini kamuoyunun bilgisine sunar. Konut ve taşıt ediniminde murabaha yöntemi sunulmaya devam edilecektir. Bununla birlikte, müşterilerin dönemsel nakit ihtiyaçları için bankalarla iş birliği çerçevesinde faiz işletimli rotatif kredi seçeneği de sağlanacaktır. Sözleşmelerde yer alan vade farkı ve gecikme bedeli maddeleri ödeme planına göre belirlenecektir. Portföy yönetiminde ağırlıklı olarak sukuk ve kira sertifikalarına yer verilmekle birlikte, getiriyi artırmak amacıyla zaman zaman spekülatif emtia pozisyonları ve türev işlemler portföye dâhil edilebilecektir. Tüm ürünlerin danışma kurulu onayından geçtiği belirtilir. İşbu duyuru, müşterilerimizin bilgilendirilmesi amacıyla kamuoyuna saygıyla sunulur.`,

  // 11 — Yasaklı sektör iştirak duyurusu (alkol/şarap üretimi yurt içi, kumarhane/casino yurt dışı)
  `Şirketimiz, çeşitlendirme stratejisi kapsamında gerçekleştirdiği yeni iştirak ve yatırımları pay sahiplerinin bilgisine sunar. Yurt içindeki bira ve şarap üretim tesisimizin kapasite artırım yatırımı tamamlanmış olup, üretim hacminin önümüzdeki dönemde yükselmesi beklenmektedir. Ayrıca, yurt dışında kumarhane ve casino işletmeciliği yapan ortaklığımızdaki hisse payımız artırılmış, ilgili ülkelerdeki eğlence ve bahis segmentindeki konumumuz güçlendirilmiştir. Yurt dışı tütün ürünleri dağıtım ağımızın genişlemesiyle bu iş kollarından elde edilen konsolide gelirlerin toplam ciro içindeki ağırlığının artması öngörülmektedir. Söz konusu yatırımların kârlılığa olumlu katkı sağlaması beklenmektedir. İşbu açıklama, şeffaflık ilkesi gereği pay sahiplerimizin ve kamuoyunun bilgisine saygıyla sunulur.`,

  // 12 — Tamamen temiz kontrol metni (yasaklı terim YOK, false-positive testi için)
  `Şirketimiz, yeni dönem sürdürülebilirlik ve kurumsal sorumluluk raporunu kamuoyunun bilgisine sunar. Bu dönemde üretim tesislerimizde yenilenebilir enerji kullanım oranı artırılmış, su tüketimini azaltan verimli sistemlere geçiş yapılmış ve atık geri dönüşüm süreçleri güçlendirilmiştir. Çalışanlara yönelik mesleki gelişim ve eğitim programları genişletilmiş, iş sağlığı ve güvenliği uygulamaları ileri standartlara taşınmıştır. Müşteri memnuniyeti anketlerinde geçen yıla kıyasla belirgin iyileşme gözlemlenmiş; özellikle teslimat hızı ve satış sonrası destek alanlarında olumlu geri bildirimler alınmıştır. Toplumsal katkı projeleri kapsamında çeşitli eğitim kurumlarıyla iş birlikleri başlatılmıştır. İşbu rapor, paydaşlarımızın bilgilendirilmesi amacıyla kamuoyuna saygıyla sunulur.`
]