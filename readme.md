# Tool Hub

Browser-based document utilities for English and Malayalam DOCX cleanup, PDF/image conversion, and HTML merging. The English DOCX Cleaner removes soft hyphens, blank paragraphs, and extra spaces while preserving the original file and processing it in the browser.

## Public information pages

The site publishes standalone `about.html`, `contact.html`, `privacy.html`, and `terms.html` pages, plus `guides.html` with instructions and conversion limitations. Keep these disclosures accurate when tools, hosting, analytics, advertising, or file-processing behavior changes. The privacy page's Cookie settings link returns to the home page and opens the existing consent controls.

## Malayalam Proofreader + OCR

The tool is available at `malayalam-proofreader.html`. OCR runs in the visitor's browser using Tesseract.js; its Malayalam language data is downloaded from the library's CDN on first use. AI proofreading is currently unavailable. Text and OCR images are not sent to an AI service.

## GitHub Pages deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` publishes the static site from the repository's default branch. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Each deployment includes the website's HTML, JavaScript, CSS, SVG, and `ads.txt` files; the source ZIP and project documentation are not published.

GitHub Pages serves static files and does not run server-side functions. Local OCR, imports, and drafts remain usable without a backend.

## Google Analytics and AdSense

Google Analytics and AdSense are configured in `index.html`; each integration loads only after the visitor allows it in the site's privacy choices. The current AdSense publisher and ad-slot IDs are:

```text
ca-pub-2068362554953585
5028118829
```

```js
window.toolHubGoogleConfig = {
	analyticsMeasurementId: 'G-XXXXXXXXXX',
	adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
	adsenseSlotId: '1234567890'
};
```

Use your own GA4 measurement ID, AdSense publisher ID, and ad-unit slot ID if replacing these values. The site loads Analytics and shows the ad placement only after the visitor allows the corresponding optional service in Cookie settings. Blank or invalid IDs keep the integrations inactive.

Before serving ads, finish the AdSense site review and publish its required disclosures and matching `ads.txt` entry. For visitors in the EEA, UK, or Switzerland, connect a Google-certified consent management platform; the built-in preferences are not a certified CMP and do not by themselves guarantee legal compliance or AdSense approval.