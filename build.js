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
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&amp;ev=PageView&amp;noscript=1" alt=""></noscript>` : '';
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
:root{--bg:#0d0f12;--ink:#e8e6e0;--ink2:#a8a49b;--ink3:#6f6b63;--card:#14171c;--rule:#23272e;--accent:#e07b2a;--green:#4a9c6d;--ease:cubic-bezier(.23,1,.32,1)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:96px}
body{background:var(--bg);color:var(--ink);font:17px/1.7 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;z-index:50;background:rgba(13,15,18,.82);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);border-bottom:1px solid transparent;transition:border-color .25s var(--ease),background-color .25s var(--ease)}
header.scrolled{background:rgba(13,15,18,.92);border-bottom-color:var(--rule)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:16px;padding-bottom:16px}
.brand{font-weight:800;letter-spacing:-.02em;font-size:20px;color:var(--ink);transition:opacity .18s var(--ease)}
.brand:hover{text-decoration:none;opacity:.85}
.brand span{color:var(--accent)}
nav{display:flex;align-items:center}
.nav-link{position:relative;display:inline-flex;align-items:center;gap:5px;color:var(--ink2);font-size:15px;padding:10px 2px;margin-left:18px;background:none;border:0;cursor:pointer;font:inherit;transition:color .18s var(--ease)}
.nav-link::after{content:'';position:absolute;left:0;right:0;bottom:4px;height:2px;background:var(--accent);border-radius:2px;transform:scaleX(0);transform-origin:left;transition:transform .2s var(--ease)}
.nav-link:hover{color:var(--ink);text-decoration:none}
.nav-link:hover::after,.nav-link[aria-expanded="true"]::after,.nav-link.active::after{transform:scaleX(1)}
.nav-link[aria-expanded="true"],.nav-link.active{color:var(--ink)}
.nav-link.active{color:var(--accent)}
.nav-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.nav-link:active{transform:scale(.97)}
.chev{display:inline-block;transition:transform .2s var(--ease)}
.nav-link[aria-expanded="true"] .chev{transform:rotate(180deg)}
.dropdown{position:absolute;top:100%;left:0;margin-top:6px;min-width:250px;background:var(--card);border:1px solid var(--rule);border-radius:12px;padding:6px;box-shadow:0 12px 32px rgba(0,0,0,.45),0 2px 8px rgba(0,0,0,.3);transform-origin:top left;transform:scale(.96) translateY(-4px);opacity:0;visibility:hidden;pointer-events:none;transition:transform .18s var(--ease),opacity .18s var(--ease),visibility 0s linear .18s}
.nav-item{position:relative;display:inline-block}
.nav-item.open .dropdown,.dropdown:focus-within{transform:scale(1) translateY(0);opacity:1;visibility:visible;pointer-events:auto;transition:transform .18s var(--ease),opacity .18s var(--ease)}
.dd-label{display:block;padding:8px 14px 4px;color:var(--ink3);font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase}
.dropdown a{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 14px;border-radius:8px;color:var(--ink);font-size:14.5px;line-height:1.4}
.dropdown a:hover{background:rgba(224,123,42,.12);color:var(--accent);text-decoration:none}
.dropdown a:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.dropdown a:active{transform:scale(.98)}
.dd-count{color:var(--ink3);font-family:ui-monospace,monospace;font-size:11px}
.dd-sep{height:1px;background:var(--rule);margin:6px 8px}
.dd-flag{color:var(--ink3);font-size:13px}
.tagline{color:var(--ink2);font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.hero{padding:48px 0 20px}
h1.hero-h{font-size:38px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px}
.hero p{color:var(--ink2);max-width:640px}
.grid{display:grid;gap:2px;margin:32px 0 60px}
.post-card{background:var(--card);border:1px solid var(--rule);border-radius:12px;padding:22px 24px}
.post-card h2{font-size:20px;letter-spacing:-.01em;margin-bottom:6px}
.post-card h2 a{color:var(--ink)}
.meta{color:var(--ink3);font-family:ui-monospace,monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;display:flex;gap:10px;flex-wrap:wrap}
.paid{color:var(--green)}
.excerpt{color:var(--ink2);font-size:15px}
article{padding:40px 0 30px}
article h1{font-size:34px;letter-spacing:-.03em;line-height:1.15;margin:20px 0 12px}
article h2{font-size:26px;letter-spacing:-.02em;margin:40px 0 14px}
article h3{font-size:21px;margin:32px 0 10px}
article h4{color:var(--ink3);font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:28px 0 8px}
article p{margin:0 0 20px;color:var(--ink);font-size:17px}
article h2,article h3{color:var(--ink)}
article ul,article ol{margin:0 0 20px 24px;color:var(--ink)}
article li{margin-bottom:8px}
article blockquote{border-left:3px solid var(--accent);color:var(--ink2);font-size:18px;font-style:italic;padding:4px 0 4px 20px;margin:0 0 22px}
article code{background:var(--card);border:1px solid var(--rule);border-radius:6px;padding:.1em .4em;font-size:.88em}
article pre{background:var(--card);border:1px solid var(--rule);border-radius:10px;padding:16px 18px;overflow-x:auto;margin:0 0 20px}
article pre code{background:none;border:0;padding:0;font-size:13px;line-height:1.55;color:var(--ink2)}
article table{border-collapse:collapse;width:100%;margin:0 0 20px;font-size:14.5px}
article th,article td{border:1px solid var(--rule);padding:8px 12px;text-align:left;vertical-align:top}
article th{background:var(--card);font-weight:700}
article tr:nth-child(even) td{background:rgba(20,23,28,.5)}
article figure{margin:0 0 24px}
.byline{color:var(--ink3);font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
.backto{border-top:1px solid var(--rule);padding:22px 0 60px}
footer{border-top:1px solid var(--rule);padding:30px 0 60px;color:var(--ink3);font-size:14px}
footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
@media(max-width:640px){h1.hero-h{font-size:30px}article h1{font-size:28px}
nav{width:100%;justify-content:flex-start;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px}
.nav-link{margin-left:0;margin-right:18px;padding:10px 4px;font-size:14px;white-space:nowrap}
.dropdown{position:static;box-shadow:none;min-width:0;margin-top:2px;display:none;transform:none;opacity:1;visibility:hidden;pointer-events:none}
.nav-item.open .dropdown{display:block;visibility:visible;pointer-events:auto}
.dropdown a{padding:10px 12px}}
.skip-link{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;z-index:100;background:var(--accent);color:#fff;padding:8px 16px;border-radius:4px;font-size:14px}
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
|.newsletter form{flex-direction:column}
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