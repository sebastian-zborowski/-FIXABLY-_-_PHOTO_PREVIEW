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

    const imageExtensions = ['png', 'jpg', 'jpeg', 'heic'];
    const pdfExtensions = ['pdf'];

    const previewDiv = document.createElement('div');
    previewDiv.style.position = 'fixed';
    previewDiv.style.top = '20px';
    previewDiv.style.left = '20px';
    previewDiv.style.backgroundColor = 'white';
    previewDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    previewDiv.style.zIndex = '9999';
    previewDiv.style.display = 'none';
    previewDiv.style.paddingTop = '40px';
    previewDiv.style.boxSizing = 'border-box';
    previewDiv.style.fontFamily = 'Arial, sans-serif';
    previewDiv.style.overflow = 'hidden';
    previewDiv.style.borderRadius = '4px';

    const filenameLabel = document.createElement('div');
    filenameLabel.style.position = 'absolute';
    filenameLabel.style.top = '0';
    filenameLabel.style.left = '0';
    filenameLabel.style.width = '100%';
    filenameLabel.style.height = '40px';
    filenameLabel.style.lineHeight = '40px';
    filenameLabel.style.textAlign = 'center';
    filenameLabel.style.fontWeight = '700';
    filenameLabel.style.fontSize = '16px';
    filenameLabel.style.borderBottom = '1px solid #ccc';
    filenameLabel.style.backgroundColor = '#fff';
    filenameLabel.style.boxSizing = 'border-box';
    filenameLabel.style.userSelect = 'none';
    previewDiv.appendChild(filenameLabel);

    const previewContent = document.createElement('div');
    previewContent.style.width = '100%';
    previewContent.style.height = 'calc(100% - 40px)';
    previewContent.style.display = 'flex';
    previewContent.style.alignItems = 'center';
    previewContent.style.justifyContent = 'center';
    previewContent.style.overflow = 'hidden';
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

        if (imageExtensions.includes(ext) || pdfExtensions.includes(ext)) {
            console.log(`${filename} TO JEST ${ext.toUpperCase()}`);

            filenameLabel.textContent = filename;
            previewContent.innerHTML = '';

            if (imageExtensions.includes(ext)) {
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
                    const minHeight = window.innerHeight * 0.1;

                    const widthRatio = maxWidth / width;
                    const heightRatio = maxHeight / height;
                    const ratio = Math.min(widthRatio, heightRatio, 1);

                    let displayWidth = width * ratio;
                    let displayHeight = height * ratio;

                    displayWidth = Math.max(displayWidth, minWidth);
                    displayHeight = Math.max(displayHeight, minHeight);

                    previewDiv.style.width = `${displayWidth}px`;
                    previewDiv.style.height = `${displayHeight + 40}px`;
                    previewDiv.style.top = '20px';
                    previewDiv.style.left = '20px';
                };
                previewContent.appendChild(img);

            } else if (pdfExtensions.includes(ext)) {
                previewDiv.style.width = '50vw';
                previewDiv.style.height = '70vh';
                previewDiv.style.top = '20px';
                previewDiv.style.left = '20px';

                const obj = document.createElement('object');
                obj.data = target.href;
                obj.type = 'application/pdf';
                obj.style.width = '100%';
                obj.style.height = '100%';
                previewContent.appendChild(obj);
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

})();
