import {HTMLElement} from 'node-html-parser'

const htmlElementToParagraph = (elem: HTMLElement) => {
  const bodyElement = elem.querySelector('body')
  let targetText = ''
  if (bodyElement) {
    targetText = bodyElement.textContent
  } else {
    targetText = elem.textContent
  }
  const paragraphList: string[] = []
  targetText.split(/\r?\n/).forEach((paraStr) => {
    const outputStr = paraStr.trim()
    if (outputStr.length > 0) {
      paragraphList.push(outputStr)
    }
  })
  return paragraphList
}

export default htmlElementToParagraph
