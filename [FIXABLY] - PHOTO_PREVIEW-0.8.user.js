// ==UserScript==
// @name         [FIXABLY] - PHOTO_PREVIEW
// @version      1.2
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

//Ostatnia aktualizacja 31.07.2025

(function () {
    'use strict';

    if (!/^https:\/\/ispot\.fixably\.com\/pl\/orders\/3\d+/.test(location.href)) return;

    const code = `(() => {
        // URLa dozwolone
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
            const link = event.target.closest('a[href]');
            if (!link || !link.closest('.dropdown-menu')) return;

            const filename = parseFilename(link.href);
            if (!filename) return;

            const ext = filename.split('.').pop().toLowerCase();

            if (![...iframeExtensions, ...imgExtensions].includes(ext)) return;

            filenameLabel.textContent = filename;
            previewContent.innerHTML = '';

            if (iframeExtensions.includes(ext)) {
                previewDiv.style.width = '50vw';
                previewDiv.style.height = '70vh';

                const iframe = document.createElement('iframe');
                iframe.src = link.href;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.backgroundColor = 'white';
                previewContent.appendChild(iframe);

            } else if (imgExtensions.includes(ext)) {
                const img = document.createElement('img');
                img.src = link.href;
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
                };

                previewContent.appendChild(img);
            }

            previewDiv.style.display = 'block';
        });

        document.body.addEventListener('mouseout', function(event) {
            if (!event.relatedTarget || !previewDiv.contains(event.relatedTarget)) {
                previewDiv.style.display = 'none';
                previewContent.innerHTML = '';
            }
        });
    })();`;

    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);
})();
