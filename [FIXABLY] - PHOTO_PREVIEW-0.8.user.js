// ==UserScript==
// @name         [FIXABLY] - PHOTO_PREVIEW
// @version      1.0
// @description  Podgląd załączonych do Fixably plików, po najechaniu na nie
// @author       Sebastian Zborowski
// @match        https://ispot.fixably.com/pl/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @updateURL    https://github.com/sebastian-zborowski/-FIXABLY-_-_PHOTO_PREVIEW/blob/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js
// @downloadURL  https://github.com/sebastian-zborowski/-FIXABLY-_-_PHOTO_PREVIEW/blob/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO,
//nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu
//usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja 30.07.2025

(function () {
    'use strict';

    const styleId = 'preview-style';
    let observer = null;
    let previewTimeout;

    const createPreviewElements = () => {
        if (!document.getElementById(styleId)) {
            const previewStyles = `
                <style id="${styleId}">
                  #preview-popup {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    max-width: 35%;
                    height: auto;
                    border-radius: 5%;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    z-index: 99999;
                    display: none;
                    overflow: auto;
                    margin: 15px;
                    pointer-events: none;
                    background-color: white;
                  }

                  #preview-popup iframe,
                  #preview-popup img {
                    max-width: 100%;
                    max-height: 100%;
                  }
                </style>
            `;
            $('head').append(previewStyles);
        }

        if ($('#preview-popup').length === 0) {
            const previewDiv = $('<div>', { id: 'preview-popup' });
            $('body').append(previewDiv);
        }
    };

    const removePreviewElements = () => {
        $('#preview-popup').remove();
        $(`#${styleId}`).remove();
    };

    const bindHoverPreview = () => {
        $('body').off('mouseenter.preview mouseleave.preview');

        $('body').on('mouseenter.preview', '.dropdown-menu a', function () {
            clearTimeout(previewTimeout);
            createPreviewElements();

            const href = $(this).attr('href');
            if (!href) return;

            let content = '';
            if (/\.(pdf)$/i.test(href)) {
                content = `<iframe src="${href}" frameborder="0"></iframe>`;
            } else {
                content = `
                    <img src="${href}" alt="Preview"
                        onerror="this.onerror=null; this.replaceWith(document.createTextNode('Cannot load preview'));">
                `;
            }

            $('#preview-popup').html(content).fadeIn(100);
        });

        $('body').on('mouseleave.preview', '.dropdown-menu a, .dropdown-menu', function () {
            previewTimeout = setTimeout(() => {
                $('#preview-popup').fadeOut(200, removePreviewElements);
            }, 300);
        });
    };

    const unbindHoverPreview = () => {
        $('body').off('mouseenter.preview mouseleave.preview');
        removePreviewElements();
    };

    const startObserver = () => {
        if (observer) return;
        observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (
                    mutation.addedNodes.length &&
                    Array.from(mutation.addedNodes).some(node =>
                        node.nodeType === 1 && $(node).find('.dropdown-menu a').length
                    )
                ) {
                    bindHoverPreview();
                    break;
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    const stopObserver = () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    const checkAndRun = () => {
        const isOrderPage = /\/order/.test(window.location.href);

        if (isOrderPage) {
            bindHoverPreview();
            startObserver();
        } else {
            unbindHoverPreview();
            stopObserver();
        }
    };

    $(document).ready(() => {
        checkAndRun();
    });

    let lastUrl = location.href;
    setInterval(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            checkAndRun();
        }
    }, 500);

})();
