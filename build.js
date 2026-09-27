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
const GSC_VERIFICATION = 'gsc-placeholder-verify'; // replace with real token from GSC
const GA4_MEASUREMENT_ID = 'G-1SHK57ERQ5'; // SparkSphearTechSolutions GA4
const TITLE_MAX = 60;

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
    return `<a href="${u.startsWith('http')?u:'/p/'+u.replace(/^\/|\/p\//g,'')}">${t}</a>`;
  });
  return s;
}
function md2html(md){
  const lines = md.split('\n');
  let html = '', inList = false, inOl = false;
  const closeLists = ()=>{ if(inList){html+='</ul>';inList=false;} if(inOl){html+='</ol>';inOl=false;} };
  for (let i=0;i<lines.length;i++){
    let l = lines[i];
    if (/^\s*$/.test(l)) { closeLists(); continue; }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { closeLists(); const lv=m[1].length; html += `<h${lv}>${inline(m[2])}</h${lv}>`; continue; }
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
${gsc}${ga4}${extraHead}<style>
:root{--bg:#0d0f12;--ink:#e8e6e0;--ink2:#a8a49b;--ink3:#6f6b63;--card:#14171c;--rule:#23272e;--accent:#e07b2a;--green:#4a9c6d}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:17px/1.7 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid var(--rule);padding:20px 0}
header .wrap{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}
.brand{font-weight:800;letter-spacing:-.02em;font-size:20px;color:var(--ink)}
.brand span{color:var(--accent)}
nav a{color:var(--ink2);margin-left:18px;font-size:15px;padding:10px 0;display:inline-block}
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
.byline{color:var(--ink3);font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
.backto{border-top:1px solid var(--rule);padding:22px 0 60px}
footer{border-top:1px solid var(--rule);padding:30px 0 60px;color:var(--ink3);font-size:14px}
footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
@media(max-width:640px){h1.hero-h{font-size:30px}article h1{font-size:28px}}
.skip-link{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;z-index:100;background:var(--accent);color:#fff;padding:8px 16px;border-radius:4px;font-size:14px}
.skip-link:focus{left:16px;top:8px;width:auto;height:auto;overflow:visible}
</style></head><body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header><div class="wrap"><a class="brand" href="/">SPARKSPHEAR<span>&nbsp;FIELD NOTES</span></a>
<nav aria-label="Primary"><a href="/p/research">Research</a><a href="/p/industries-we-spark">Industries</a><a href="/p/what-is-the-sparksphear-team-about">About</a><a href="/p/what-does-the-sparksphear-team-about">Start Here</a></nav></div></header>
<main id="main-content" class="wrap">${body}</main>
<footer><div class="wrap"><div>${esc(TAGLINE)}</div><div>© 2026 SPARKSPHEAR TECH SOLUTIONS LLC</div></div></footer>
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

const home = layout(TITLE, DESC, `\
<section class="hero"><div class="tagline">${esc(TAGLINE)}</div>
<h1 class="hero-h">SPARKSPHEAR FIELD NOTES</h1>
<p>${esc(DESC)}</p></section>
<section class="grid">${cards}</section>`, '', homepageJsonLd);
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
<article>${paidBanner}${body}</article>
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