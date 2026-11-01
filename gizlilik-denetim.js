/* ============================================================
   Gizlilik sayfası denetimi (Muslimly 1.0.2 App Privacy, nur Görev 89)
   Her açık dilin gizlilik.html'i (tr kök, öbürleri <kod>/): <html lang> = kod, yön doğru,
   veri bölümünün iki cümlesi dil/<kod>.json'dakiyle aynı ve şunları içeriyor:
     - p[1]: anonim kurulum numarası notu ("IDFA" ve "IDFV" adlarıyla)
     - p[2]: App Store beyanında Yaklaşık Konum (Overpass, Apple)
   Kullanım: node gizlilik-denetim.js   (uret.js'ten sonra; çıkış 1 = hata)
   ============================================================ */
const fs = require("fs");
const path = require("path");
const KOK = __dirname;
const ACIK = JSON.parse(fs.readFileSync(path.join(KOK, "dil", "acik.json"), "utf8"));
const RTL = ["ar", "ur", "fa", "he"];
const kacis = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let hata = 0;
for (const kod of ACIK) {
  const d = JSON.parse(fs.readFileSync(path.join(KOK, "dil", `${kod}.json`), "utf8"));
  const html = fs.readFileSync(path.join(KOK, kod === "tr" ? "" : kod, "gizlilik.html"), "utf8");
  const h = [];
  const lang = (html.match(/<html[^>]*\blang="([^"]+)"/) || [])[1], dir = (html.match(/<html[^>]*\bdir="([^"]+)"/) || [])[1];
  if (lang !== kod) h.push(`lang="${lang}"`);
  if ((dir || "ltr") !== (RTL.includes(kod) ? "rtl" : "ltr")) h.push(`dir="${dir}"`);
  const [p1, p2] = d.gizlilik.bolumler[1].p.slice(1, 3);
  if (!html.includes(kacis(p1)) && !html.includes(p1)) h.push("p[1] sayfada yok");
  if (!html.includes(kacis(p2)) && !html.includes(p2)) h.push("p[2] sayfada yok");
  if (!/IDFA/.test(p1) || !/IDFV/.test(p1)) h.push("p[1]: IDFA/IDFV notu yok");
  if (!/Overpass/.test(p2) || !/Apple/.test(p2)) h.push("p[2]: Overpass/Apple yok (Yaklaşık Konum beyanı)");
  if (h.length) { hata++; console.log(`  ✗ ${kod}: ${h.join("; ")}`); }
}
console.log(hata ? `  ✗ ${hata} / ${ACIK.length} gizlilik sayfasında hata` : `  ✓ ${ACIK.length} gizlilik sayfası: lang/dir doğru, Yaklaşık Konum ve anonim kurulum numarası notu var`);
process.exit(hata ? 1 : 0);
