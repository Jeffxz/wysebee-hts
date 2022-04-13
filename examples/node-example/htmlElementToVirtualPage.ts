import {HTMLElement} from 'node-html-parser'

const htmlElementToVirtualPage = (elem: HTMLElement) => {
  const bodyElement = elem.querySelector('body')
  let targetText = ''
  if (bodyElement) {
    targetText = bodyElement.textContent
  } else {
    targetText = elem.textContent
  }
  const virtualPageList: string[] = []
  let virtualPageString = ""
  for (var i = 0; i < targetText.length; i++) {
    virtualPageString += targetText.charAt(i)
    if (i % 1000 === 0) {
      virtualPageList.push(virtualPageString)
      virtualPageString = ""
    }
  }
  return virtualPageList
}

export default htmlElementToVirtualPage
