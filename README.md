# ThriftTally

A resale-fee calculator + blog for people flipping thrifted, vintage, and
secondhand items. Compares net payout across eBay, Etsy, Poshmark, Depop,
Mercari, Facebook Marketplace, and Whatnot, then monetizes the resulting
traffic through AdSense and (once wired) affiliate links.

**Live structure**
```
index.html                                   Calculator (homepage)
blog/index.html                               Blog listing ("corkboard")
blog/where-to-sell-vintage-clothing-2026.html Platform guide
blog/ebay-vs-etsy-vs-poshmark-fees.html       Fee comparison w/ dollar table
blog/how-to-price-thrifted-items.html         Pricing strategy guide
css/styles.css                                Design system (single stylesheet)
js/calculator.js                              Fee-calculation engine + rendering
js/main.js                                    Shared tiny helpers (footer year)
assets/                                       favicon, OG image, logo
sitemap.xml, robots.txt
```

## Tech stack
Static HTML/CSS/vanilla JS, no build step, no framework, no backend. Deploys
as-is to Vercel, Netlify, or GitHub Pages — drag-and-drop or `git push` both
work.

## Design
- **Palette:** the 5 supplied brand colors (midnight-violet background,
  sunlit-clay / coral-glow / soft-peach / frosted-mint as accents), used as a
  *dark* base rather than the more common light/cream layout.
- **Type:** Fraunces (display serif) + Work Sans (body) + IBM Plex Mono
  (numbers/data), loaded from Google Fonts.
- **Signature element:** results render as vintage swing-tag / price-tag
  cards (string hole, notch, dashed stitching, slight rotation), and the
  blog listing renders as a corkboard of pinned note cards — both reinforce
  the "secondhand shop" subject matter instead of a generic dashboard look.

## Fee data
Every formula in `js/calculator.js` is commented with its source logic
(commission %, processing %, flat fees). Rates reflect each platform's
public seller rate card as verified **April 2026**. Marketplaces change
these without much notice — re-verify before a major update, and bump the
"fees last checked" copy in `index.html` when you do.

## Monetization — what's wired vs. what you need to add
**Wired:**
- Google AdSense loader using your real publisher ID
  (`ca-pub-8643026289824701`) on every page.

**You need to add:**
- **AdSense ad-slot IDs** — 5 placeholder `.ad-slot` blocks are marked
  `<!-- TODO(owner) -->` across the site. Either paste real slot IDs from
  your AdSense dashboard into `<ins class="adsbygoogle">` units, or simply
  turn on **Auto Ads** for the domain and delete the placeholder divs.
- **Affiliate links** — `AFFILIATE_LINKS` at the top of `js/calculator.js`
  currently points each "List it on ___" button at the platform's plain
  homepage. Once you're approved for the eBay Partner Network / Ambassador
  Program and the Etsy Affiliate Program, swap in your tracked links there.
  Poshmark's affiliate program is campaign-based rather than a persistent
  link, so it's left pointing at the homepage.
- **Google Analytics + Search Console** — commented out in `index.html`
  `<head>`; add your `G-XXXXXXX` measurement ID and verification meta tag.
- **Domain** — canonical URLs, sitemap, and OG tags all use
  `https://thrifttally.com/` as a placeholder. Update every occurrence (a
  find-and-replace across all HTML files + `sitemap.xml` + `robots.txt`) once
  you've registered the real domain.

## Local dev
```
python3 -m http.server 8000
```
then open `http://localhost:8000/`.

## SEO
- Full meta/OG/Twitter tags, canonical URLs, and `robots.txt` + `sitemap.xml`
  are in place for all 5 pages.
- JSON-LD: `WebApplication` + `Organization` + `FAQPage` on the homepage,
  `Blog` on the blog index, `BlogPosting` on each post — all validated.
- Content is written to satisfy AdSense's "substantial content" bar (each
  blog post runs 800–1,000+ words of original text) rather than being a bare
  JS tool with no crawlable copy.

## Adding a 4th/5th blog post
Copy any file in `blog/` as a template, keep the shared `<head>` block
(fonts, styles, AdSense loader), write a new `BlogPosting` JSON-LD block, and
add the URL to both `sitemap.xml` and the `blogPost` array in
`blog/index.html`'s JSON-LD — then add a new `.note-card` link on the
listing page itself.
