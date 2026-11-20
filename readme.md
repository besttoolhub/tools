# Tool Hub

Browser-based document utilities for English and Malayalam DOCX cleanup, PDF/image conversion, and HTML merging. The English DOCX Cleaner removes soft hyphens, blank paragraphs, and extra spaces while preserving the original file and processing it in the browser.

The Batch File Renamer provides browser-based folder renaming previews and a ZIP download fallback.

## Public information pages

The site publishes standalone `about.html`, `contact.html`, `privacy.html`, and `terms.html` pages, plus `guides.html` with instructions and conversion limitations. Keep these disclosures accurate when tools, hosting, analytics, advertising, or file-processing behavior changes. The privacy page's Cookie settings link returns to the home page and opens the existing consent controls.

## Malayalam Proofreader + OCR

The tool is available at `malayalam-proofreader.html`. OCR runs in the visitor's browser using Tesseract.js; its Malayalam language data is downloaded from the library's CDN on first use. AI proofreading is currently unavailable. Text and OCR images are not sent to an AI service.

## GitHub Pages deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` publishes the static site from the repository's default branch. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Each deployment includes the website's HTML, JavaScript, CSS, SVG, and `ads.txt` files; the source ZIP and project documentation are not published.

GitHub Pages serves static files and does not run server-side functions. Local OCR, imports, and drafts remain usable without a backend.

## Google Analytics

Google Analytics is configured in `index.html`; it loads only after the visitor allows it in the site's privacy choices.

```js
window.toolHubGoogleConfig = {
	analyticsMeasurementId: 'G-XXXXXXXXXX'
};
```

Use your own GA4 measurement ID if replacing this value. The site loads Analytics only after the visitor allows it in Cookie settings. Blank or invalid IDs keep the integration inactive.