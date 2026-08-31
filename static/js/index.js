// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    if (!bibtexElement || !button) return;

    const copyText = button.querySelector('.copy-text');

    function feedback(message) {
        button.classList.add('copied');
        if (copyText) copyText.textContent = message;
        // Announce the result to assistive technology.
        button.setAttribute('aria-label', message + ' BibTeX to clipboard');
        setTimeout(function() {
            button.classList.remove('copied');
            if (copyText) copyText.textContent = 'Copy';
            button.setAttribute('aria-label', 'Copy BibTeX to clipboard');
        }, 2000);
    }

    const text = bibtexElement.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(function() { feedback('Copied!'); })
            .catch(function(err) {
                console.error('Failed to copy: ', err);
                legacyCopy(text) ? feedback('Copied!') : feedback('Copy failed');
            });
    } else {
        legacyCopy(text) ? feedback('Copied!') : feedback('Copy failed');
    }
}

// Fallback for browsers without the async clipboard API.
function legacyCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(textArea);
    return ok;
}

// Scroll to top, honoring reduced-motion preferences.
function scrollToTop() {
    const reduced = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}

// Show/hide the scroll-to-top button.
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) return;
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});
