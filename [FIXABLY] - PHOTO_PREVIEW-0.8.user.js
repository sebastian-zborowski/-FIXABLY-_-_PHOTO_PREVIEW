// ==UserScript==
// @name         [FIXABLY] - PHOTO_PREVIEW
// @version      1.0
// @description  Podgląd załączonych do Fixably plików, po najechaniu na nie
// @author       Sebastian Zborowski
// @match        https://ispot.fixably.com/pl/*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_photo-preview/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_photo-preview/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO,
//nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu
//usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja 01.08.2025

(function() {
    'use strict';

    const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.pdf'];

    function isSupportedFile(href) {
        return SUPPORTED_EXTENSIONS.some(ext => href.toLowerCase().includes(ext));
    }

    function createPreviewFrame() {
        const frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '20px';
        frame.style.left = '20px';

        frame.style.width = '50vw';
        frame.style.height = '70vh';
        frame.style.maxWidth = '90vw';
        frame.style.maxHeight = '90vh';

        frame.style.minWidth = '10vw';
        frame.style.minHeight = '10vh';

        frame.style.zIndex = '9999';
        frame.style.border = '2px solid #444';
        frame.style.borderRadius = '8px';
        frame.style.boxShadow = '0 0 12px rgba(0,0,0,0.3)';
        frame.style.background = 'white';
        frame.style.display = 'none';
        frame.style.overflow = 'hidden';

        frame.setAttribute('scrolling', 'no');
        frame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        frame.id = 'filePreviewFrame';

        document.body.appendChild(frame);
        return frame;
    }

    const previewFrame = createPreviewFrame();
    window.preview = function(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');

        if (!isSupportedFile(href)) return;

        previewFrame.onload = () => {
            try {
                const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                const img = doc.querySelector('img');
                if (img) {
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    img.style.objectFit = 'contain';
                    img.style.display = 'block';
                    img.style.margin = 'auto';
                }
            } catch (e) {
                // wyłapywanie błędów CORS'a
            }
        };

        previewFrame.src = href;
        previewFrame.style.display = 'block';
    };

    window.hidePreview = function() {
        previewFrame.style.display = 'none';
        previewFrame.src = '';
    };

    function attachPreviewHandlers() {
        const allLinks = document.querySelectorAll('.dropdown-menu a[href]');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (link.dataset.previewBound) return;
            if (!isSupportedFile(href)) return;

            link.setAttribute('onmouseover', 'preview(event)');
            link.setAttribute('onmouseout', 'hidePreview()');
            link.dataset.previewBound = 'true';
        });
    }

    const observer = new MutationObserver(() => attachPreviewHandlers());
    observer.observe(document.body, { childList: true, subtree: true });

    attachPreviewHandlers();



// Kontrola wersji alert ---------------------------------------------------------
    checkScriptVersions();

function checkScriptVersions() {
    const scriptList = [
        { name: 'PHOTO_PREVIEW', url: 'https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_photo-preview/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js' },
    ];

    const currentVersions = {
        PHOTO_PREVIEW: '1.0',
    };

    Promise.all(scriptList.map(script => {
        return fetch(script.url)
            .then(res => res.text())
            .then(text => {
                const match = text.match(/@version\s+([0-9.]+)/);
                if (match) {
                    const version = match[1];
                    localStorage.setItem(script.name, JSON.stringify({
                        name: script.name,
                        remote: version
                    }));
                    console.log(`[VERSION CONTROL] ${script.name}: ${version}`);
                } else {
                    console.warn(`[VERSION CONTROL] Nie znaleziono wersji dla: ${script.name}`);
                }
            })
            .catch(err => {
                console.warn(`[VERSION CONTROL] Błąd ładowania ${script.name}:`, err);
            });
    })).then(() => {
        let popupCount = 0;
        scriptList.forEach(script => {
            const storedStr = localStorage.getItem(script.name);
            if (!storedStr) return;
            try {
                const data = JSON.parse(storedStr);
                const remoteVer = data?.remote;
                const currentVer = currentVersions[script.name] || '0.0';

                if (remoteVer && compareVersions(remoteVer, currentVer) > 0) {
                    showUpdatePopup(script.name, currentVer, remoteVer, popupCount++);
                }
            } catch(e) {
                console.warn(`[UPDATE CHECK] Błąd sprawdzania wersji dla ${script.name}:`, e);
            }
        });
    });

    function compareVersions(v1, v2) {
        const split1 = v1.split('.').map(Number);
        const split2 = v2.split('.').map(Number);
        const length = Math.max(split1.length, split2.length);
        for (let i = 0; i < length; i++) {
            const a = split1[i] || 0;
            const b = split2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

    function showUpdatePopup(scriptName, current, remote, index) {
        const popup = document.createElement('div');
        popup.textContent = `🔔 Aktualizacja dostępna dla ${scriptName}: ${remote} (masz ${current})`;
        Object.assign(popup.style, {
            position: 'fixed',
            bottom: `${20 + index * 100}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#222',
            color: '#fff',
            padding: '24px 36px',
            borderRadius: '16px',
            fontSize: '18px',
            zIndex: 9999 + index,
            boxShadow: '0 0 20px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'opacity 0.3s ease',
            opacity: '1',
            maxWidth: '90%',
            textAlign: 'center',
        });

        popup.addEventListener('click', () => popup.remove());

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 7500);
    }
}
// ---------------------------------------------------------------------------------

})();
