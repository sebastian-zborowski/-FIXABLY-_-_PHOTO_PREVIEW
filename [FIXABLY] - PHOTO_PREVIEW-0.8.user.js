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

(function () {
    'use strict';

    if (!/^https:\/\/ispot\.fixably\.com\/pl\/orders\/3\d+/.test(location.href)) return;

    const code = `(() => {
        if (!/^https:\\/\\/ispot\\.fixably\\.com\\/pl\\/orders\\/3\\d+/.test(location.href)) return;

        function parseFilename(url) {
            try {
                const urlObj = new URL(url);
                if(urlObj.searchParams.has('key')) {
                    const key = decodeURIComponent(urlObj.searchParams.get('key'));
                    const parts = key.split('/');
                    return parts[parts.length - 1];
                } else {
                    const parts = urlObj.pathname.split('/');
                    return parts[parts.length - 1];
                }
            } catch(e) {
                return null;
            }
        }

        const iframeExtensions = ['png', 'heic', 'pdf'];
        const imgExtensions = ['jpg', 'jpeg'];

        const previewDiv = document.createElement('div');
        Object.assign(previewDiv.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            backgroundColor: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: '9999',
            display: 'none',
            paddingTop: '40px',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            borderRadius: '4px',
        });

        const filenameLabel = document.createElement('div');
        Object.assign(filenameLabel.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '40px',
            lineHeight: '40px',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '16px',
            borderBottom: '1px solid #ccc',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            userSelect: 'none',
        });
        previewDiv.appendChild(filenameLabel);

        const previewContent = document.createElement('div');
        Object.assign(previewContent.style, {
            width: '100%',
            height: 'calc(100% - 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        });
        previewDiv.appendChild(previewContent);

        document.body.appendChild(previewDiv);

        document.body.addEventListener('mouseover', function(event) {
            const target = event.target.closest('a[href]');
            if (!target) return;
            if (!target.closest('.dropdown-menu')) return;

            const filename = parseFilename(target.href);
            if (!filename) {
                previewDiv.style.display = 'none';
                return;
            }

            const dotIndex = filename.lastIndexOf('.');
            if (dotIndex === -1) {
                previewDiv.style.display = 'none';
                return;
            }

            const ext = filename.slice(dotIndex + 1).toLowerCase();

            if (iframeExtensions.includes(ext) || imgExtensions.includes(ext)) {
                filenameLabel.textContent = filename;
                previewContent.innerHTML = '';

                if (iframeExtensions.includes(ext)) {
                    previewDiv.style.width = '50vw';
                    previewDiv.style.height = '70vh';
                    previewDiv.style.top = '20px';
                    previewDiv.style.left = '20px';

                    const iframe = document.createElement('iframe');
                    iframe.src = target.href;
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.backgroundColor = 'white';
                    previewContent.appendChild(iframe);

                } else if (imgExtensions.includes(ext)) {
                    const img = document.createElement('img');
                    img.src = target.href;
                    img.style.display = 'block';
                    img.style.objectFit = 'contain';
                    img.style.maxWidth = '50vw';
                    img.style.maxHeight = '80vh';

                    img.onload = () => {
                        const width = img.naturalWidth;
                        const height = img.naturalHeight;

                        const maxWidth = window.innerWidth * 0.5;
                        const maxHeight = window.innerHeight * 0.8;
                        const minWidth = window.innerWidth * 0.3;
                        const minHeight = window.innerHeight * 0.3;

                        const widthRatio = maxWidth / width;
                        const heightRatio = maxHeight / height;
                        const ratio = Math.min(widthRatio, heightRatio, 1);

                        let displayWidth = width * ratio;
                        let displayHeight = height * ratio;

                        displayWidth = Math.max(displayWidth, minWidth);
                        displayHeight = Math.max(displayHeight, minHeight);

                        previewDiv.style.width = displayWidth + 'px';
                        previewDiv.style.height = (displayHeight + 40) + 'px';
                        previewDiv.style.top = '20px';
                        previewDiv.style.left = '20px';
                    };

                    previewContent.appendChild(img);
                }

                previewDiv.style.display = 'block';

            } else {
                previewDiv.style.display = 'none';
            }
        });

        document.body.addEventListener('mouseout', function(event) {
            const related = event.relatedTarget;
            if (!related || !event.target.closest) return;

            const fromLink = event.target.closest('a[href]');
            if (fromLink && fromLink.closest('.dropdown-menu')) {
                if (!related.closest || !related.closest('.dropdown-menu')) {
                    previewDiv.style.display = 'none';
                    previewContent.innerHTML = '';
                }
            }
        });
    })();`;

    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);

// Kontrola wersji alert ---------------------------------------------------------
(async function() {
    const scriptList = [
        { name: 'PHOTO_PREVIEW', url: 'https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_photo-preview/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js' },
    ];

    const currentVersions = {
        PHOTO_PREVIEW: '1.0',
    };

    await Promise.all(scriptList.map(async script => {
        try {
            const res = await fetch(script.url);
            const text = await res.text();
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
        } catch (err) {
            console.warn(`[VERSION CONTROL] Błąd ładowania ${script.name}:`, err);
        }
    }));

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
            // animacja znikania
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 7500);
    }
})();
// ---------------------------------------------------------------------------------

})();
