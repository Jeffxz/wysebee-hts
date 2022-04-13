// Step 1. Get text
const bodyElement = document.querySelector('body');
const targetText = bodyElement.textContent.trim();

// Skip Step 2

// Step 3. Get graphemes
const segmenterTarget = new Intl.Segmenter('jp', { granularity: 'word' });
const iterator1 = segmenterTarget.segment(targetText)[Symbol.iterator]();
let test = 0;
const limit = 1000;
let pageStr = ''
for (const segment of iterator1) {
  pageStr += segment.segment
  if (test++ >= limit) {
    test = 0
    console.log(pageStr)
    pageStr = ''
  }
}
