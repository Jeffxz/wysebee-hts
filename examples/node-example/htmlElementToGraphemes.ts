import {HTMLElement} from 'node-html-parser'
import {createIntlSegmenterPolyfill} from 'intl-segmenter-polyfill'
import * as fs from 'fs'

const htmlElementToGraphemes = (elem: HTMLElement) => {
  // Step 1. Get text
  const bodyElement = elem.querySelector('body')
  let targetText = ''
  if (bodyElement) {
    targetText = bodyElement.textContent
  } else {
    targetText = elem.textContent
  }
  console.log(targetText)
  // Step 3 list up Graphemes
  const wasmBuffer = fs.readFileSync('node_modules/intl-segmenter-polyfill/dist/break_iterator.wasm')
  let wasmBinary = new Uint8Array(wasmBuffer);

  (async () => {
    const Segmenter = await createIntlSegmenterPolyfill(wasmBinary)
    const segmenter = new Segmenter("ja", {granularity: 'word'})
    const segments = segmenter.segment(targetText)
    console.log(segments.length)
    console.log(segments[0])
  })()

  const virtualPageList: string[] = []
  let virtualPageString = ""
  /*
  for (var i = 0; i < targetText.length; i++) {
    virtualPageString += targetText.charAt(i)
    if (i % 1000 === 0) {
      virtualPageList.push(virtualPageString)
      virtualPageString = ""
    }
  }
  */
  return virtualPageList
}

export default htmlElementToGraphemes
