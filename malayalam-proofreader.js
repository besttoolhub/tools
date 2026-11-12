(() => {
  const editor = document.getElementById('editor');
  const titleInput = document.getElementById('draft-title');
  const editorStatus = document.getElementById('editor-status');
  const ocrStatus = document.getElementById('ocr-status');
  const imageInput = document.getElementById('image-file');
  const imagePreview = document.getElementById('image-preview');
  const dropZone = document.getElementById('drop-zone');
  const draftsRoot = document.getElementById('drafts');
  const storageKey = 'tool-hub-malayalam-proofreader-v1';
  const maxImageBytes = 8 * 1024 * 1024;
  let currentDraftId = '';
  let selectedImageUrl = '';
  let tesseractLoader;

  document.getElementById('save-draft').addEventListener('click', saveDraft);
  document.getElementById('new-draft').addEventListener('click', newDraft);
  document.getElementById('download-text').addEventListener('click', downloadText);
  document.getElementById('import-text').addEventListener('click', importText);
  document.getElementById('choose-image').addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const [file] = imageInput.files || [];
    if (file) recognizeImage(file);
    imageInput.value = '';
  });
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragging');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragging');
    const [file] = event.dataTransfer.files || [];
    if (file) recognizeImage(file);
  });

  function setStatus(element, message, kind = '') {
    element.textContent = message;
    element.classList.toggle('error', kind === 'error');
    element.classList.toggle('success', kind === 'success');
  }

  function getDrafts() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? saved.filter((draft) => draft && typeof draft.id === 'string' && typeof draft.body === 'string') : [];
    } catch (error) {
      setStatus(editorStatus, 'Saved drafts could not be read from this browser.', 'error');
      return [];
    }
  }

  function storeDrafts(drafts) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(drafts));
      return true;
    } catch (error) {
      setStatus(editorStatus, 'Could not save this draft. Browser storage may be full or disabled.', 'error');
      return false;
    }
  }

  function renderDrafts() {
    const drafts = getDrafts().sort((a, b) => b.updated - a.updated);
    draftsRoot.replaceChildren();
    if (!drafts.length) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No saved drafts yet.';
      draftsRoot.append(empty);
      return;
    }
    drafts.forEach((draft) => {
      const row = document.createElement('li');
      row.className = 'draft-row';
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'btn draft-name';
      open.textContent = draft.title || draft.body.trim().split(/\s+/).slice(0, 6).join(' ') || 'Untitled draft';
      open.title = 'Open saved draft';
      open.addEventListener('click', () => {
        currentDraftId = draft.id;
        titleInput.value = draft.title;
        editor.value = draft.body;
        setStatus(editorStatus, 'Draft opened.');
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete ${draft.title || 'untitled draft'}`);
      remove.addEventListener('click', () => {
        if (storeDrafts(getDrafts().filter((item) => item.id !== draft.id))) renderDrafts();
      });
      row.append(open, remove);
      draftsRoot.append(row);
    });
  }

  function newDraft() {
    currentDraftId = '';
    titleInput.value = '';
    editor.value = '';
    setStatus(editorStatus, 'New draft.');
    editor.focus();
  }

  function saveDraft() {
    const body = editor.value.trim();
    if (!body) {
      setStatus(editorStatus, 'Enter or import some text before saving.', 'error');
      return;
    }
    const drafts = getDrafts();
    const id = currentDraftId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const draft = { id, title: titleInput.value.trim(), body: editor.value, updated: Date.now() };
    const existingIndex = drafts.findIndex((item) => item.id === id);
    if (existingIndex < 0) drafts.push(draft);
    else drafts[existingIndex] = draft;
    if (storeDrafts(drafts)) {
      currentDraftId = id;
      renderDrafts();
      setStatus(editorStatus, 'Draft saved in this browser.', 'success');
    }
  }

  function downloadText() {
    if (!editor.value.trim()) {
      setStatus(editorStatus, 'There is no text to download.', 'error');
      return;
    }
    const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFilename(titleInput.value) || 'malayalam-draft'}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function safeFilename(value) {
    return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 80);
  }

  function importText() {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = '.txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    picker.addEventListener('change', async () => {
      const [file] = picker.files || [];
      if (!file) return;
      try {
        if (/\.docx$/i.test(file.name)) {
          setStatus(editorStatus, 'Loading Word document reader…');
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', () => Boolean(window.mammoth));
          const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          editor.value = result.value;
        } else {
          editor.value = await file.text();
        }
        titleInput.value = file.name.replace(/\.(txt|docx)$/i, '');
        currentDraftId = '';
        setStatus(editorStatus, 'File imported in your browser. Save it as a draft if you want to keep it.', 'success');
      } catch (error) {
        setStatus(editorStatus, error.message || 'Could not read the selected file.', 'error');
      }
    }, { once: true });
    picker.click();
  }

  function loadScript(src, isReady) {
    if (isReady()) return Promise.resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('A required library could not be loaded. Check your connection and try again.')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error('A required library could not be loaded. Check your connection and try again.'));
      };
      document.head.append(script);
    });
  }

  async function loadTesseract() {
    if (window.Tesseract) return window.Tesseract;
    if (!tesseractLoader) {
      tesseractLoader = loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', () => Boolean(window.Tesseract));
    }
    await tesseractLoader;
    return window.Tesseract;
  }

  async function recognizeImage(file) {
    if (!file.type.startsWith('image/')) {
      setStatus(ocrStatus, 'Choose an image file.', 'error');
      return;
    }
    if (file.size > maxImageBytes) {
      setStatus(ocrStatus, 'Image is too large. Choose an image under 8 MB.', 'error');
      return;
    }
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    selectedImageUrl = URL.createObjectURL(file);
    imagePreview.src = selectedImageUrl;
    imagePreview.classList.add('visible');
    setStatus(ocrStatus, 'Loading Malayalam OCR engine and language data…');
    document.getElementById('choose-image').disabled = true;
    let worker;
    try {
      const Tesseract = await loadTesseract();
      worker = await Tesseract.createWorker('mal', 1, {
        logger: (progress) => {
          if (progress.status) {
            const percent = Number.isFinite(progress.progress) ? ` ${Math.round(progress.progress * 100)}%` : '';
            setStatus(ocrStatus, `${progress.status}${percent} — your image is processed in this browser.`);
          }
        }
      });
      const result = await worker.recognize(file);
      editor.value = (result.data.text || '').trim();
      titleInput.value = file.name.replace(/\.[^.]+$/, '');
      currentDraftId = '';
      setStatus(ocrStatus, editor.value ? 'Text recognized. Review and correct the OCR result, then save it.' : 'No text was recognized. Try a clearer, higher-resolution image.', editor.value ? 'success' : 'error');
      if (editor.value) setStatus(editorStatus, 'OCR text added to the editor.');
    } catch (error) {
      setStatus(ocrStatus, error.message || 'Could not recognize this image. Check your connection and try again.', 'error');
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (error) {
          setStatus(ocrStatus, 'OCR finished, but its worker could not be closed cleanly.', 'error');
        }
      }
      document.getElementById('choose-image').disabled = false;
    }
  }

  renderDrafts();
})();
