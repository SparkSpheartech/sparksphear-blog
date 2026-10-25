// Static site generator for sparkspheartechsolutions.blog
// Builds from writizzy_content_export.json (14 posts, full markdown)
const fs = require('fs');
const path = require('path');

const bundle = JSON.parse(fs.readFileSync('C:/Users/shaza/writizzy_content_export.json', 'utf8'));
const OUT = path.join(__dirname, 'public');
const TITLE = 'SPARKSPHEAR FIELD NOTES';
const TAGLINE = 'Research the pain. Choose the tool. Build the system.';
const DESC = 'Practical research on business systems, software decisions, and AI automation for owner-led service businesses. Learn what to fix and what to automate.';
const DOMAIN = 'https://sparkspheartechsolutions.blog';
const OG_IMAGE = DOMAIN + '/images/og-default.png';
const GSC_VERIFICATION = '62419175358087346175'; // replace with real token from GSC
const GA4_MEASUREMENT_ID = 'G-3G7GT1GM5K'; // SparkSphearTechSolutions GA4
const META_PIXEL_ID = '2986453348391113'; // Meta (Facebook) Pixel
const TITLE_MAX = 60;

// Social media URLs for the blog
const SOCIAL_LINKS = [
  { label: 'LinkedIn', url: 'https://linkedin.com/company/sparksphear', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>' },
  { label: 'X (Twitter)', url: 'https://x.com/sparksphear', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  { label: 'YouTube', url: 'https://youtube.com/@sparksphear', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.4 31.4 0 000 12a31.4 31.4 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.4 31.4 0 0024 12a31.4 31.4 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>' }
];

// Newsletter endpoint: proxied same-origin by Vercel to Odoo's
// /website_mass_mailing/subscribe (JSON-RPC). Keeps the browser same-origin
// so no CORS is needed, and the Odoo list stays the single source of truth.
const NEWSLETTER_ENDPOINT = '/api/newsletter';
const NEWSLETTER_LIST_ID = 1;

// Minimal markdown -> HTML (headings, paragraphs, lists, bold, links, code, blockquote, hr)
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function inline(s){
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m,t,u)=>{
    // Fix old Writizzy domain links → new domain slugs
    if (/blog\.sparkspheartechsolutions\.com/.test(u)) {
      const slug = u.split('/').pop().replace(/\.html$/,'');
      return `<a href="/p/${slug}">${t}</a>`;
    }
    return `<a href="${u.startsWith('http')?u:'/p/'+u.replace(/^(\/p\/|\/|p\/)+/,'')}">${t}</a>`;
  });
  return s;
}
function md2html(md){
 const lines = md.split('\n');
 let html = '', inList = false, inOl = false, inCode = false, codeBuf = [];
 const closeLists = ()=>{ if(inList){html+='</ul>';inList=false;} if(inOl){html+='</ol>';inOl=false;} };
 for (let i=0;i<lines.length;i++){
  let l = lines[i];
  if (inCode) {
   if (/^```\s*$/.test(l.trim())) { html += `<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`; inCode=false; codeBuf=[]; }
   else codeBuf.push(l);
   continue;
  }
  if (/^```/.test(l.trim())) { closeLists(); inCode=true; codeBuf=[]; continue; }
  if (/^\s*$/.test(l)) { closeLists(); continue; }
  let m;
  if ((m = l.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/))) { closeLists(); const src = /^https?:\//.test(m[2]) ? m[2] : '/' + m[2].replace(/^\.?\//,''); html += `<figure><img src="${esc(src)}" alt="${esc(m[1])}" loading="lazy" style="max-width:100%;border-radius:10px;border:1px solid var(--rule)"></figure>`; continue; }
  if (l.trimStart().startsWith('|') && i+1<lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])) {
   closeLists();
   const cells = row => row.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
   let tbl = '<div style="overflow-x:auto"><table>';
   tbl += '<thead><tr>' + cells(l).map(c=>`<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
   i += 2;
   while (i<lines.length && lines[i].trimStart().startsWith('|')) { tbl += '<tr>' + cells(lines[i]).map(c=>`<td>${inline(c)}</td>`).join('') + '</tr>'; i++; }
   i--;
   tbl += '</tbody></table></div>';
   html += tbl;
   continue;
  }
  if ((m = l.match(/^(#{1,4})\s+(.*)/))) { closeLists(); const lv=m[1].length; const hid=(lv<=3)?m[2].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''):''; html += `<h${lv}${hid?` id="${hid}"`:''}>${inline(m[2])}</h${lv}>`; continue; }
    if (/^>\s?/.test(l)) { closeLists(); html += `<blockquote><p>${inline(l.replace(/^>\s?/,''))}</p></blockquote>`; continue; }
    if (/^(-{3,}|\*{3,})$/.test(l.trim())) { closeLists(); html += '<hr>'; continue; }
    if ((m = l.match(/^\s*[-*]\s+(.*)/))) { closeLists(); if(!inList){html+='<ul>';inList=true;} html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = l.match(/^\s*(\d+)\.\s+(.*)/))) { closeLists(); if(!inOl){html+='<ol>';inOl=true;} html += `<li>${inline(m[2])}</li>`; continue; }
    closeLists();
    html += `<p>${inline(l)}</p>`;
  }
  closeLists();
  return html;
}

const postMeta = bundle.map(p => ({
  slug: p.slug, title: p.title, excerpt: p.excerpt || '',
  date: p.publishedAt ? p.publishedAt.slice(0,10) : '',
  accessMode: p.accessMode, tags: typeof p.tags === 'object' && !Array.isArray(p.tags) && p.tags ? [p.tags.name].filter(Boolean) : []
})).sort((a,b)=>b.date.localeCompare(a.date));

const bbCount = postMeta.filter(p=>/barbershop/.test(p.slug)).length;

// Remove emoji prefix, truncate to TITLE_MAX chars, add ellipsis if needed
function cleanTitle(title) {
  let t = title.replace(/^[\u{1F400}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]+/u, '').trim();
  if (t.length > TITLE_MAX) t = t.slice(0, TITLE_MAX - 1).trim() + '\u2026';
  return t;
}

function layout(title, desc, body, slug='', extraHead='') {
  const cTitle = cleanTitle(title);
  const isHome = title === TITLE;
  const pageUrl = isHome ? DOMAIN : DOMAIN + '/p/' + slug;
  const ogType = isHome ? 'website' : 'article';
  // Article-specific metadata
  const articleMeta = isHome ? '' : (() => {
    const d = postMeta.find(p => p.slug === slug);
    const dt = d ? d.date : '';
    return dt ? `<meta property="article:published_time" content="${dt}T00:00:00+00:00">
<meta property="article:author" content="SPARKSPHEAR Field Notes">
<meta property="article:section" content="Business Systems">` : '';
  })();
  // GA4 snippet
  const ga4 = GA4_MEASUREMENT_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_MEASUREMENT_ID}');</script>` : '';
  // Meta (Facebook) Pixel — PageView on every page
const metaPixel = META_PIXEL_ID ? `<script>!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');</script>
<noscript><img height="1" width="1" style=display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&amp;ev=PageView&amp;noscript=1" alt=""></noscript>` : '';
// GSC verification
  const gsc = GSC_VERIFICATION ? `<meta name="google-site-verification" content="${GSC_VERIFICATION}">` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(cTitle)}</title><meta name="description" content="${esc(desc||DESC)}">
<link rel="icon" href="/images/favicon.ico" type="image/x-icon"><link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="canonical" href="${pageUrl}">
<meta property="og:title" content="${esc(cTitle)}"><meta property="og:description" content="${esc(desc||DESC)}">
<meta property="og:type" content="${ogType}"><meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${esc(OG_IMAGE)}"><meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(title)}">
<meta property="og:site_name" content="SPARKSPHEAR FIELD NOTES">
${articleMeta}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(cTitle)}">
<meta name="twitter:description" content="${esc(desc||DESC)}"><meta name="twitter:image" content="${esc(OG_IMAGE)}">
${gsc}${ga4}${metaPixel}${extraHead}<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600&display=swap');
:root{--bg:#FFFFFF;--ink:#111827;--ink2:#6B7280;--ink3:#9CA3AF;--card:#F9FAFB;--rule:#E5E7EB;--accent:#e07b2a;--green:#4a9c6d;--ease:cubic-bezier(.23,1,.32,1)}*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;scroll-padding-top:96px;font-family:'Poppins',sans-serif}body{background:var(--bg);color:var(--ink);font:17px/1.7 'Inter',system-ui,sans-serif}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}.wrap{max-width:1280px;margin:0 auto;padding:0 32px}header{position:sticky;top:0;z-index:50;background:rgba(255,255,25,.92);backdrop-filter:blur(14px)saturate(160%);border-bottom:1px solid var(--rule);transition:border-color .25s ease,background-color .25s ease}header.scrolled{background:rgba(255,,5,98);border-bottom-color:var(--rule)}header .wrap{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;padding-top:24px;padding-bottom:24px}.brand{font-weight:700;font-family:'Poppins',sans-serif;font-size:30px;color:var(--ink);letter-spacing:-.02em;transition:opacity .18s ease}.brand:hover{text-decoration:none;opacity:.85}.brand span{color:var(--accent)}nav{display:flex;align-items:center}.nav-link{position:relative;display:inline-flex;align-items:center;gap:6px;color:var(--ink2);font-size:15px;padding:10px 2px;margin-left:24px;background:none;border:0;cursor:pointer;font:inherit;transition:color .18s ease}.nav-link::after{content:'';position:absolute;left:0;right:0;bottom:4px;height:3px;background:var(--accent);border-radius:3px;transform:scaleX(0);transform-origin:left;transitionon:transform .2s ease}.nav-link:hover{color:var(--ink);text-decoration:none}.nav-link:hover::after,.nav-link[aria-expanded="true"]::after,.nav-link.active::after{transform:scaleX(1)}.nav-link[aria-expanded="true"],.nav-link.active{color:var(--ink)}.nav-link.active{color:var(--accent)}.nav-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}.nav-link:active{transform:scale(.97)}.chev{display:inline-block;transition:transform .2s ease}.nav-item{position:relative;display:inline-block}.dropdown{position:absolute;top:100%;left:0;margin-top:10px;min-width:260px;background:#FFFFFF;border:1px solid var(--rule);border-radius:16px;padding:8px;box-shadow:0 4px 16px rgba(0,0,0,.1),0 2px 8px rgba(0,0,,.06);transform-origin:top left;transform:scale(.96) translateY(-4px);opacity:0;visibility:hidden;pointer-events:none;transition:transform .18s ease,opacity .18s ease,var(--ease) 0s linear .18s}.nav-item.open .dropdown,.dropdown:focus-within{transform:scale(1) translateY(0);opacity:1;visibility:visible;pointer-events:auto;transition:transform .18s ease;opacity .18s ease}}.dd-label{display:block;padding:8px 14px 4px;color:var(--ink3);font-family:'Inter',sans-serif;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase}.dropdown a{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:var(--ink);font-size:14.5px;line-height:1.5}.dropdown a:hover{background:rgba(224,123,42,.08);color:var(--accent);text-decoration:none}.dropdown a:focus-visible{outline:2px solid var(--a"ccent");outline-offset:-2px}.dropd"own a:active{transform:scale(.98)}.dd-count{color:var(--in"k3);fo"nt-family:"ui-monospace,m"onospace;font-size:11px}.dd-sep{height:1px;b"ackground:var(--rule)"margin:8px 8px}.dd-flag{colo"r:var(--ink3);"font-size:13px}.tagline{color:var(--ink2);"font-family:'In"ter','ui-monospace",monospace;font-size:12px;le"tter-spacing:.14em;text-transfo"rm:uppercase}.hero{padding:64px 0 "3"2xp,max-width:768xp}"h1.hero-h{font-fami"ly:'Poppins","san"serif;font-size:3"8xp;font-weight:60,letter-spacing:-.03em,line-height:1.2;margin-bottom:16px,colo"r:#1118"27}".hero p{color:va"r(--ink2);"font-size:18x;line-height:1."5,max-width:704xp}".grid{display:-grid,gap:2"4xp;margin:40x 0 "80xp}".post-card{background:#FFFFFF,bor"der:1px solid #E5E"7EB,border-rad"ius:1"6xp,padd"in"g:32px 36xp,t"ransition:b"ox-shadow .2s var("-ease),transfo"rm .2s v"a"(–e)ase,b"order-col"or .2s vari"-ease},animat"ion:fadeIn .3s ease".post-card:hover{box-shad"ow:0 4xp 1"2px rgba(0,0,,.0"8),"transform:translateY(-2px),borde"r-color:#D1"D5DB}@keyframes fadeIn{from{opacity:0;"transform:translateY("1"0px)}to{opacity:1;transform:translateY(0)}}.post-card h2{fon"t-family:'Poppins",sans-serif;font-siz"e:20xp;font-weight:600,let"ter-spacing:-.01em;margin-bottom:10xp,line-height:1.4}"post-card h2 a{color:var(--in"k)}.meta{colo"r:va"r(--ink3);fon"t-family:'Inter',sans-serif,fon"t-size:11.5px,l"etter-spacing:.08em,text-tran"form:uppercase;margin-bottom:12px;display:flex;gap:10x;fle"x-wrap:wrap}"paid{color:va"r(--green"}
.excerpt{colo"r:va"r(--in"k2)"font-size:15px,line-height:1.6}"article{padding:48xp 0 "40px,max-width:768px}"article h1{font-fa"mily:'Poppins","sans-serif,"font-size:34xp;font-weight:"60,"lette"r-spacing:-.03em,lin"e-height:1.25,margi"n:24xp 0 "16px,color:#1118"27}"article h2{font-fam"ily:'Poppins","san"serif,"font-size":26px;font-weight:600,"letter-spacing:-.0"2em,margi"n:48px 0 "16px;color:#1118"27}"article h3{"font-family:'Poppins",sans-serif,"font-size":21px,"font-weight:60"0,margi"n:36px 0 "1"2xp,colo"r:#1118"27}".article h4{color:va"r(--ink3);"font-family:'In"ter',"sans-serif;font-size:12px,"letter-spac"in"g:.14em;text-transf"orm:uppercase,margi"n:28px 0 "8px}"article p{margin:0 0 "24xp,colo"r:va"r(--in"k),font-size:17px,lin"e-height:1.7}"article h2,article h3{color:va"r(--in"k)"article ul,article ol{margin:0 0 "24px 24px,colo"r:va"r(--in"k}"article li{margin-bott"om:10px}"article blockquote{border-left:3px solid va"r(--accent),"color:va"r(--i"nk2),"font-family:'In"ter','ui-monospace",monospace,fon"t-size:18xp,font-style:italic,padd"in"g:4px 0 "4px 2"4xp,margi"n:0 0 2"4xp,background:rgba(2"24,"123,"4,.0"4);border-radius:0 8x 8p"x 0}"article code{background:var(--ca"rd),borde"r:1px solid var(--rule),border-rad"ius:6xp,padding::.1em .4m,fon"t-size:.88em}"article pre{background:var(--car"d),borde"r:1px solid var(--rule),border-radi"us:10xp,padding::20px;border-radius:10xp;padding::2"0px 2"2px;overflow-x:auto;margin:0 0 "24xp}"article pre code{background:none,border:0,padd"in"g:0,fon"t-size:13px,line-height:1.55,colo"r:va"r(--in"k2)"fon"t-family:"ui-monospace,m"onospace}"article table{bo"rder-collap"se:collapse;width:100%,mar"gin:0 0 "24xp,fon"t-size:14.5p"x}"article th,article td{bo"rder:1px solid va"r(-rul)e;padding:1"0xp 1"4px;text-align:left,vertical-alig:n:t"op}"article th{backgroun"nd:var(--c"ard)fon"t-weight:700}"article tr:nth-child(even)td{"background:rgba("249,"250,"2"51,.5)"article figure{margin:0 0 "24xp}.byline{color:va"r(--ink3);"font-family:'Inter',san"serif,fo"nt-size:12px,l"etter-spac"in"g:.08em,text-transf"orm:uppercase,margi"n-bottom:1"0px}".backto{bord"er-top:1px solid var("rule),padding:2"4xp 0 "60xp"}footer{border-t"op:1px solid var(--rule),padding:40xp 0 "80xp,colo"r:va"r(--ink3),"font-size:14xp}"footer .wrap{display:-flex,jus"tify-content:space-between,flex-wrap:wrap,gap:16xp}"@media(max-width:1024px){.wrap{max-width:1024p"x}}@media(max-width:7"68px){h1.hero-h{"fo"nt-size:3"0xp}"article h1{"fo"nt-size":28xp}"article h2{"fo"nt-size":22xp}.wrap{max-width:768px},grid{gap:1"6px}.post-card{padding:2"4px}}"nav{wid"th:1"00%;"justify-content:flex-start;overfl"ow-x-auto;-webkit-overflow-scrolling:touch,padding-bott"om:4xp}"margin-left:-4px}.nav-link{margi"n-left:0,margi"n-right:18xp,padding::10x "4px,font-size:14px,white-space:nowrap}
.dropdown{position:static,box-shad"ow:none,min-wid"th:0,margi"n-top:4xp;display:none;"transform:none,opacity:1,visibility:hidden,pointer-events:none}"nav-item.open .dropd"own{display:block,visibility:visible,pointe"rs-events:auto}"dropdown a{padding:12px 1"4xp,border-radius:"10p"x}"skip-link{posi"tion:absolute,left:-9999px,top:auto,width:1px,height:1px,overflow-hidden,z-index:10"0,background:va"r(--a"c"cent)"color:#fff,padd"in"g:8px 1"6px,border-rad"ius:4xp,fon"t-size:14xp}"search-wrap{posi"tion:relative,margi"n-left:24xp,d"isplay:flex,align-items:center}"search-wrap input{wid"th:0,padding::0,border:0,border-radi"us:8xp,background:transparent,colo"r:va"r(--in"k)"fon"t:inherit,transition:wid"th .3s va"r(–ease),padding .3s v"a"r(–ease),"border-co"lor .3s var("-ease),backg"ound .3s va"r("--ease);outline:none,curs"or:pointer}"search-wrap inpu"t:focus,.search-wrap input.expanded{wid"th:180xp,padding::8px 1"2px 8px 3"x,"borde"r:1px solid var(--rule),background:var(--ca"rd)}".search-wrap inpu"t:focus{wid"th:220xp}"search-btn{background:none,border:0,color:va"r(--ink2),cursor:pointer,padding:4xp,margin-right:6xp,d"isplay:flex,align-items:center,t"ransition:color .18s vari"-ease}"search-btn:hover{color:va"r(--ink)}.search-re"sults{position:absolute;top:100%,right:0,margi"n-top:8xp,wid"th:320xp,max-height:360xp,overfl"ow-y:auto,background:#FFFFFF,borde"r:1px solid var("--rul)e,border-rad"ius:16px,box-shadow:0 4p"x 1"6xp rgba(0,0,,".1),0 "2p"x 8xp r"gba(0,"0,0,".06),display:none,z-index:100}"search-results.visible{di"play:block}"search-resul"ts a{display:-flex,flex-directi"on:column,padding::12px 1"6px,bor"der-bottom:1px solid va"r(-ru"le),colo"r:va"r(--in"k),text-deco"ration:none,transiti"on:backg"ound .15s vari"-ease}".search-resul"ts a:last-child{bor"der-bottom:none}".search-resul"ts a:hover{backg"round:rgba(2"24,"123,"4,".06)"}.search-resul"ts .sr-title{font-size:14px,fon"t-weight:600,margi"n-bottom:2xp}"search-resul"ts .sr-date{"fon"t-size:11x,colo"r:va"r(--ink3);"font-family:"ui-monospace,"monospace}"search-no-re"sults{padding:16xp;"colo"r:va"r(--ink3),"font-size:14px,text-align:cente"r}"newslett"er{bac"kgound:#F9FAFB,"border:1px solid var(--rule),border-radius:16xp,padd"in"g:2"4px 2"8xp;margin:40xp 0}"newslett"er h3{"fon"t-family:'Poppins",sans-serif,fo"nt-siz"e:18px,margi"n-bo"ttom:8px,color:va"r(--in"k)"fon"t-weight:600}"newslett"er p{color:va"r(--ink2),"fon"t-size:14px,margi"n-"bottom:16px,line-height:1.6}".newslett"er form{display:-flex,gap:10px;fle"x-wrap:wrap}".newslett"er input[type="ema"+"il"]{fl"ex:1,min-wid"th:180px,padding::12xp 1"4px,"borde"r:1px solid va"r(-rul)e,bor"der-rad"ius:10px,background:#FFFFFF,colo"r:va"r(--in"k)"fon"t:inherit,font-size:14p"x,o"utline:none}".newslett"er input[type="email"]:focus{bo"rder-color:var(--a"c"cent)"box-shadow:0 0 "0 3xp rgba(2"24,"123,"4,".15)}".newslett"er button{padd"ing:12px 2"4px,background:va"r(--accent)color:#fff,border:0,border-rad"ius:10xp,font:i"nherit,font-size:14px,fon"t-weight:600,curs"or:pointer,t"ransition:opacity .18s v"a"(–ease},opacity:.9}".newslett"er .nf-status{"fon"t-size:13xp,margi"n-top:8px,m"in-height:2"0px}"nf-success{colo"r:va"r(--green")}
.nf-error{color:#d45656}.toc-wrap{background:#F9FAFB,"borde"r:1px solid var("--rul)e,bord"er-ra"dius:12px,padding::2"0px 2"4xp,margi"n:0 0 "40xp}"toc-toggle{backg"round:none,borde"r:0,colo"r:va"r(--ink2),curs"or:pointer,font:inherit,fo"nt-size:14x,d"isplay:flex,align-items:center,ga"p:6xp,padding:4px 0,t"ransition:color .18s var("-ease)}.toc-togg"le:hover{color:v"a"r(--in"k)".toc-list{list-sty"le:none,padding:8px 0 "0 8xp,display:none}"toc-list.open{display:block}"toc-list li{margin-bottom:6px}"toc-list a{colo"r:va"r(--ink2),"fon"t-size:1"4xp,padding::4px 0 "4px 1"4xp,b"order-left:2px sol"id var("rule");display:-block;transition:col"or .18s va"-ease),border-co"lor .18s va"r(-e"se)}".toc-lis"t a:hover{color:var(--a"c"cent)"b"order-color:var(--ac"cent)}".toc-li"st li.toc-h3 a{padd"in"g-le"ft:2"8xp,fon"t-size:1"3xp}".social-links{displ"ay-flex,gap:1"6px,a"lign-items:center}".social-lin"ks a{color:va"r(--ink3);"transition:color .1"8s val("-ease);displa-y:flex,align-"items-center}".social-lin"ks a:hover{color:va"r(--a"ccent)}"@media(max-width:76"8px){h"1.hero-h{"fo"nt-size:"30xp}"article h1{"fo"nt-size":28xp}.newslett"er form{fl"ex-direction:column}".newslett"er input[type="ema"+"il"]{min-wid"th:100%}".newslett"er button{wid"th:1"00%"}}search-wrap inpu"t:focus,.search-wrap inpu"t.expanded{wid"th:140xp}".search-wrap inpu"t:focus{wid"th:160xp}".search-re"sults{wid"th:calc(100vw - "4"0px),right:-10xp}}"@media(prefers-reduced-motion:reduce){*,*::before,*::after{animat"ion:none!important,"t"ransition-duration:.01ms!important},html{scroll-beha"vior:auto}}"@media(prefers-redu"ced-transparency:reduce){header{background:#FFFFFF,-webki"t-backdrop-filter:none,"backdrop-filte"r:none}}
|.skip-link:focus{left:16px;top:8px;width:auto;height:auto;overflow:visible}
|.search-wrap{position:relative;margin-left:18px;display:flex;align-items:center}
|.search-wrap input{width:0;padding:0;border:0;border-radius:8px;background:transparent;color:var(--ink);font:inherit;transition:width .3s var(--ease),padding .3s var(--ease),border-color .3s var(--ease),background .3s var(--ease);outline:none;cursor:pointer}
|.search-wrap input:focus,.search-wrap input.expanded{width:180px;padding:8px 12px 8px 34px;border:1px solid var(--rule);background:var(--card)}
|.search-wrap input:focus{width:220px}
|.search-btn{background:none;border:0;color:var(--ink2);cursor:pointer;padding:4px;margin-right:6px;display:flex;align-items:center;transition:color .18s var(--ease)}
|.search-btn:hover{color:var(--ink)}
|.search-results{position:absolute;top:100%;right:0;margin-top:8px;width:320px;max-height:360px;overflow-y:auto;background:var(--card);border:1px solid var(--rule);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none;z-index:100}
|.search-results.visible{display:block}
|.search-results a{display:flex;flex-direction:column;padding:12px 16px;border-bottom:1px solid var(--rule);color:var(--ink);text-decoration:none;transition:background .15s var(--ease)}
|.search-results a:last-child{border-bottom:none}
|.search-results a:hover{background:rgba(224,123,42,.08)}
|.search-results .sr-title{font-size:14px;font-weight:600;margin-bottom:2px}
|.search-results .sr-date{font-size:11px;color:var(--ink3);font-family:ui-monospace,monospace}
|.search-no-results{padding:16px;color:var(--ink3);font-size:14px;text-align:center}
|.newsletter{background:var(--card);border:1px solid var(--rule);border-radius:14px;padding:24px 28px;margin:32px 0}
|.newsletter h3{font-size:18px;margin-bottom:6px;color:var(--ink)}
|.newsletter p{color:var(--ink2);font-size:14px;margin-bottom:14px}
|.newsletter form{display:flex;gap:8px;flex-wrap:wrap}
|.newsletter input[type="email"]{flex:1;min-width:180px;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit;font-size:14px;outline:none}
|.newsletter input[type="email"]:focus{border-color:var(--accent)}
|.newsletter button{padding:10px 20px;background:var(--accent);color:#fff;border:0;border-radius:8px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .18s var(--ease)}
|.newsletter button:hover{opacity:.9}
|.newsletter .nf-status{font-size:13px;margin-top:8px;min-height:20px}
|.nf-success{color:var(--green)}
|.nf-error{color:#d45656}
|.toc-wrap{background:var(--card);border:1px solid var(--rule);border-radius:12px;padding:18px 22px;margin:0 0 32px}
|.toc-toggle{background:none;border:0;color:var(--ink2);cursor:pointer;font:inherit;font-size:14px;display:flex;align-items:center;gap:6px;padding:4px 0;transition:color .18s var(--ease)}
|.toc-toggle:hover{color:var(--ink)}
|.toc-toggle .chev-sm{display:inline-block;transition:transform .2s var(--ease);font-size:12px}
|.toc-toggle.open .chev-sm{transform:rotate(90deg)}
|.toc-list{list-style:none;padding:8px 0 0 8px;display:none}
|.toc-list.open{display:block}
|.toc-list li{margin-bottom:4px}
|.toc-list a{color:var(--ink2);font-size:14px;padding:4px 0 4px 12px;border-left:2px solid var(--rule);display:block;transition:color .18s var(--ease),border-color .18s var(--ease)}
|.toc-list a:hover{color:var(--accent);border-color:var(--accent)}
|.toc-list li.toc-h3 a{padding-left:28px;font-size:13px}
|.social-links{display:flex;gap:16px;align-items:center}
|.social-links a{color:var(--ink3);transition:color .18s var(--ease);display:flex;align-items:center}
|.social-links a:hover{color:var(--accent)}
|@media(max-width:640px){h1.hero-h{font-size:30px}article h1{font-size:28px}
|.newsletter form{flex-direction: column}
|.newsletter input[type="email"]{min-width:100%}
|.newsletter button{width:100%}
|.search-wrap input:focus,.search-wrap input.expanded{width:140px}
|.search-wrap input:focus{width:160px}
|.search-results{width:calc(100vw - 40px);right:-10px}
|}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition-duration:.01ms!important}html{scroll-behavior:auto}}
@media(prefers-reduced-transparency:reduce){header{background:var(--bg);-webkit-backdrop-filter:none;backdrop-filter:none}}
</style></head><body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header id="site-header"><div class="wrap"><a class="brand" href="/">SPARKSPHEAR<span>&nbsp;FIELD NOTES</span></a>
<nav aria-label="Primary"><a class="nav-link" href="/p/research">Research</a><div class="nav-item"><button class="nav-link" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="industries-menu">Industries<span class="chev" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button><div class="dropdown" id="industries-menu" role="menu" aria-label="Industries"><div class="dd-label">Industries</div><a role="menuitem" href="/p/industries-we-spark">All Industries</a><div class="dd-sep"></div><a role="menuitem" href="/p/industries-we-spark#barbershops-and-salons">Barbershop<span class="dd-count">${bbCount} guides</span></a><a role="menuitem" href="/p/caregiver-capacity-case-matching-agent">Home Health Care<span class="dd-flag">↗</span></a><a role="menuitem" href="/p/research">Research &amp; Evaluations</a></div></div><a class="nav-link" href="/p/what-is-the-sparksphear-team-about">About</a><a class="nav-link" href="/p/what-does-the-sparksphear-team-about">Start Here</a><div class="search-wrap"><button class="search-btn" type="button" aria-label="Search" title="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button><input type="search" id="search-input" placeholder="Search articles…" aria-label="Search"><div class="search-results" id="search-results"></div></div></nav></div></header>
<main id="main-content" class="wrap">${body}</main>
<footer><div class="wrap"><div><div style="margin-bottom:8px">${esc(TAGLINE)}</div><div class="social-links">${SOCIAL_LINKS.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer" title="${s.label}" aria-label="${s.label}">${s.icon}</a>`).join('')}</div></div><div>© 2026 SPARKSPHEAR TECH SOLUTIONS LLC</div></div></footer>
<script>(function(){
var header=document.getElementById('site-header');
var onScroll=function(){header.classList.toggle('scrolled',window.scrollY>8)};
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
var item=document.querySelector('.nav-item');if(!item)return;
var btn=item.querySelector('button');var dd=item.querySelector('.dropdown');
function setOpen(o){item.classList.toggle('open',o);btn.setAttribute('aria-expanded',o?'true':'false')}
btn.addEventListener('click',function(e){e.stopPropagation();setOpen(btn.getAttribute('aria-expanded')!=='true')});
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
 var t;item.addEventListener('mouseenter',function(){clearTimeout(t);setOpen(true)});
 item.addEventListener('mouseleave',function(){t=setTimeout(function(){setOpen(false)},120)});}
document.addEventListener('click',function(e){if(!item.contains(e.target))setOpen(false)});
document.addEventListener('focusin',function(e){if(!item.contains(e.target))setOpen(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&item.classList.contains('open')){setOpen(false);btn.focus()}});
dd.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setOpen(false)})});
var path=location.pathname;
document.querySelectorAll('nav a.nav-link').forEach(function(a){var h=a.getAttribute('href').split('#')[0];if(h&&h===path)a.classList.add('active')});
if(path.indexOf('/p/industries-we-spark')===0||path.indexOf('/p/caregiver-capacity-case-matching-agent')===0||/barbershop/.test(path)){btn.classList.add('active')}
})();
// Search functionality
(function(){
var input=document.getElementById('search-input');
var results=document.getElementById('search-results');
var searchBtn=document.querySelector('.search-btn');
if(!input||!results)return;
var postList=[${postMeta.map(p=>JSON.stringify({slug:p.slug,title:p.title,date:p.date})).join(',')}];
var debounceTimer=null;
function showResults(list){
if(!list.length){results.innerHTML='<div class="search-no-results">No articles found</div>';results.classList.add('visible');return;}
results.innerHTML=list.map(p=>{
var d=p.date?new Date(p.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):'';
return'<a href="/p/'+p.slug+'"><span class="sr-title">'+p.title+'</span>'+(d?'<span class="sr-date">'+d+'</span>':'')+'</a>';
}).join('');
results.classList.add('visible');
}
function doSearch(q){
if(!q||q.length<2){results.classList.remove('visible');results.innerHTML='';return;}
var lower=q.toLowerCase();
var matches=postList.filter(function(p){
return p.title.toLowerCase().includes(lower)||('/p/'+p.slug).toLowerCase().includes(lower);
});
showResults(matches);
}
if(searchBtn)searchBtn.addEventListener('click',function(e){
e.stopPropagation();
input.classList.toggle('expanded');
if(input.classList.contains('expanded')){input.focus();}else{input.value='';results.classList.remove('visible');results.innerHTML='';}
});
input.addEventListener('input',function(){
clearTimeout(debounceTimer);
debounceTimer=setTimeout(function(){doSearch(input.value.trim());},200);
});
input.addEventListener('focus',function(){
if(input.value.trim().length>=2)input.classList.add('expanded');
});
document.addEventListener('click',function(e){
if(!input.contains(e.target)&&!results.contains(e.target)&&!searchBtn.contains(e.target)){
input.classList.remove('expanded');
results.classList.remove('visible');
}
});
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){
input.classList.remove('expanded');
results.classList.remove('visible');
}
});
})();
// TOC toggle
(function(){
var toggles=document.querySelectorAll('.toc-toggle');
toggles.forEach(function(btn){
var list=btn.nextElementSibling;
if(!list)return;
btn.addEventListener('click',function(e){
e.preventDefault();
var expanded=btn.getAttribute('aria-expanded')==='true';
btn.setAttribute('aria-expanded',!expanded?'true':'false');
list.classList.toggle('open');
});
});
})();
// Newsletter form handler
(function(){
var forms=document.querySelectorAll('.newsletter form');
if(!forms.length)return;
forms.forEach(function(form){
form.addEventListener('submit',function(e){
e.preventDefault();
var email=form.querySelector('input[type="email"]');
var btn=form.querySelector('button');
var status=form.nextElementSibling;
if(!email||!btn||!status)return;
var emailVal=email.value.trim();
if(!emailVal){status.textContent='Please enter your email.';status.className='nf-status nf-error';return;}
btn.disabled=true;btn.textContent='Subscribing…';status.textContent='';
try{
fetch('${NEWSLETTER_ENDPOINT}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'call',params:{list_id:${NEWSLETTER_LIST_ID},value:emailVal,subscription_type:'email'}})}).then(function(resp){
return resp.json();
}).then(function(data){
var result=(data&&data.result)||{};
if(data&&data.error){
status.textContent='Something went wrong. Please try again.';status.className='nf-status nf-error';
}else if(result.toast_type==='success'){
status.textContent='You\'re in! Check your inbox to confirm.';status.className='nf-status nf-success';
if(typeof window.fbq==='function'){window.fbq('track','Lead',{content_name:'Newsletter Signup',content_category:'Blog'});}
if(typeof window.gtag==='function'){window.gtag('event','generate_lead',{form_name:'newsletter'});}
email.value='';
}else{
status.textContent=result.toast_content||'Something went wrong. Please try again.';status.className='nf-status nf-error';
}
}).catch(function(){
status.textContent='Connection error. Please try again later.';status.className='nf-status nf-error';
}).finally(function(){btn.disabled=false;btn.textContent='Subscribe';});
}catch(err){
status.textContent='Something went wrong. Please try again.';status.className='nf-status nf-error';
btn.disabled=false;btn.textContent='Subscribe';
}
});
});
})();
</script>
</body></html>`;
}

// Build homepage
function dateFmt(d){ if(!d) return ''; const dt=new Date(d+'T00:00:00Z'); return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}); }

let cards = '';
for (const p of postMeta) {
  cards += `<div class="post-card"><div class="meta"><span>${dateFmt(p.date)}</span>${p.accessMode==='PAID'?'<span class="paid">Premium · Preview</span>':''}</div>
<h2><a href="/p/${p.slug}">${esc(p.title)}</a></h2>
<div class="excerpt">${esc(p.excerpt)}</div></div>`;
}

// Generate TOC from markdown headings
function generateTOC(markdown) {
  const tocItems = [];
  const lines = (markdown || '').split('\n');
  for (const line of lines) {
    const h2match = line.match(/^## (.+)$/);
    const h3match = line.match(/^### (.+)$/);
    if (h2match || h3match) {
      const text = (h2match ? h2match[1] : h3match[1]).trim();
      const isH3 = !!h3match;
      // Same ID algorithm as md2html: lowercase, non-alphanumeric → hyphen
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      tocItems.push({ text, id, level: isH3 ? 'h3' : 'h2' });
    }
  }
  if (tocItems.length < 3) return '';
  return `<div class="toc-wrap"><button class="toc-toggle" type="button" aria-expanded="false" aria-controls="toc-content"><span class="chev-sm" aria-hidden="true">▶</span> Table of Contents</button><ul class="toc-list" id="toc-content">${tocItems.map(t=>`<li class="toc-${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ul></div>`;
}

const homepageJsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': DOMAIN + '/#webpage',
        'url': DOMAIN,
        'name': 'SPARKSPHEAR Field Notes — Research the pain. Choose the tool. Build the system.',
        'description': DESC,
        'inLanguage': 'en-US',
        'isPartOf': { '@id': DOMAIN + '/#website' }
      },
      {
        '@type': 'WebSite',
        '@id': DOMAIN + '/#website',
        'name': 'SPARKSPHEAR Field Notes',
        'url': DOMAIN,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': DOMAIN + '/p/:search_term_string',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        'name': 'SPARKSPHEAR Tech Solutions LLC',
        'url': DOMAIN,
        'logo': { '@type': 'ImageObject', 'url': DOMAIN + '/images/favicon.ico' },
        'sameAs': []
      }
    ]
  }).replace(/"undefined"/g, 'null')}</script>`;

const home = layout(TITLE, DESC, `
<section class="hero"><div class="tagline">${esc(TAGLINE)}</div>
<h1 class="hero-h">SPARKSPHEAR FIELD NOTES</h1>
<p>${esc(DESC)}</p></section>
<section class="grid">${cards}</section>
<section class="newsletter"><h3>Stay in the loop</h3><p>Get a weekly digest of the latest SPARKSPHEAR Field Notes. No spam, just insights.</p><form><input type="email" placeholder="you@example.com" aria-label="Your email" required><button type="submit">Subscribe</button></form><div class="nf-status"></div></section>`, '', homepageJsonLd);
fs.mkdirSync(OUT, {recursive:true});
fs.writeFileSync(path.join(OUT,'index.html'), home);

// Build each post page
for (const p of bundle) {
  const body = md2html(p.markdown || '');
  const paidBanner = p.accessMode === 'PAID' ? `<p style="border:1px solid var(--rule);border-radius:10px;padding:14px 18px;background:var(--card);color:var(--ink2);font-size:14px">This is a premium workbook. Only the preview is published. Full access comes with SPARKSPHEAR Side B engagements.</p>` : '';
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
     '@context': 'https://schema.org',
     '@type': 'BlogPosting',
     'headline': p.title,
     'description': p.excerpt || DESC,
     'datePublished': p.publishedAt ? p.publishedAt.slice(0,10) : undefined,
     'dateModified': p.publishedAt ? p.publishedAt.slice(0,10) : undefined,
     'url': `https://sparkspheartechsolutions.blog/p/${p.slug}`,
     'author': { '@type': 'Organization', 'name': 'SPARKSPHEAR Field Notes' },
     'publisher': { '@type': 'Organization', 'name': 'SPARKSPHEAR Tech Solutions LLC', 'logo': { '@type': 'ImageObject', 'url': DOMAIN + '/images/favicon.ico' } },
     'image': OG_IMAGE,
     'mainEntityOfPage': `https://sparkspheartechsolutions.blog/p/${p.slug}`
   }).replace(/"undefined"/g, 'null')}</script>`;
   const html = layout(p.title, p.excerpt || DESC, `
<div class="byline">${dateFmt(p.publishedAt ? p.publishedAt.slice(0,10) : '')} · SPARKSPHEAR FIELD NOTES</div>
${paidBanner}${generateTOC(p.markdown || '')}<article id="article-content">${body}</article>
<section class="newsletter"><h3>Stay in the loop</h3><p>Get a weekly digest of the latest SPARKSPHEAR Field Notes. No spam, just insights.</p><form><input type="email" placeholder="you@example.com" aria-label="Your email" required><button type="submit">Subscribe</button></form><div class="nf-status"></div></section>
<div class="backto"><a href="/">&larr; All Field Notes</a></div>`, p.slug, jsonld);
  fs.mkdirSync(path.join(OUT,'p'), {recursive:true});
  fs.writeFileSync(path.join(OUT,'p',p.slug+'.html'), html);
}

// sitemap + robots
const urls = ['https://sparkspheartechsolutions.blog/'].concat(postMeta.map(p=>`https://sparkspheartechsolutions.blog/p/${p.slug}`));
const sitemapEntries = ['<url><loc>https://sparkspheartechsolutions.blog/</loc></url>'].concat(postMeta.map(p=>`<url><loc>https://sparkspheartechsolutions.blog/p/${p.slug}</loc><lastmod>${p.date}</lastmod></url>`).filter(Boolean));
fs.writeFileSync(path.join(OUT,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://sparkspheartechsolutions.blog/sitemap.xml\n');

console.log('built', postMeta.length, 'posts +', fs.readdirSync(OUT).length, 'files in', OUT);