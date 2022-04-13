import * as fs from 'fs'
import { Command } from 'commander'
import { parse } from 'node-html-parser'
import htmlElementToParagraph from './htmlElementToParagraph'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import { SynthesizeSpeechCommandInput } from '@aws-sdk/client-polly/dist-types/commands/SynthesizeSpeechCommand'
import { Readable } from 'stream'
import * as path from 'path'
import htmlElementToVirtualPage from './htmlElementToVirtualPage'
import htmlElementToGraphemes from './htmlElementToGraphemes'

const program = new Command()
program.option('-f, --file <html>', 'convert a single (x)html file')
program.option('-o, --output <folder>', 'store output mp3 files to folder')

program.parse(process.argv)

const client = new PollyClient({region: 'ca-central-1'})
const saveParagraphText = (fileName: string, paragraph: string, index: number, outputDir: string) => {
  const paragraphFile = `${path.basename(fileName, path.extname(fileName))}_voice_${index}.txt`
  const paragraphFilePath = path.join(outputDir, paragraphFile)
  console.log(`saving paragraph text file to local as ${paragraphFilePath}`)
  fs.writeFile(paragraphFilePath, paragraph, (error) => {
    if (error) console.error(error);
  })
}

const saveSpeech = (fileName: string, paragraph: string, index: number, outputDir: string) => {
  const input = {
    Engine: 'neural',
    Text: paragraph,
    OutputFormat: 'mp3',
    VoiceId: 'Salli'
  } as SynthesizeSpeechCommandInput
  const command = new SynthesizeSpeechCommand(input)
  client.send(command)
    .then(data => {
      if (data.AudioStream) {
        if (data.AudioStream instanceof Readable) {

          const mp3FileName = `${path.basename(fileName, path.extname(fileName))}_voice_${index}.mp3`
          const mp3FilePath = path.join(outputDir, mp3FileName)
          console.log(`saving mp3 file to local as ${mp3FilePath}`)
          const file = fs.createWriteStream(mp3FilePath);
          (data.AudioStream as Readable).pipe(file)
        }
      }
    })
    .catch(error => {
      console.log(error.message)
    })
}

const saveSpeechMark = (fileName: string, paragraph: string, index: number, outputDir: string) => {
  const input = {
    Engine: 'neural',
    Text: paragraph,
    OutputFormat: 'json',
    VoiceId: 'Salli',
    SpeechMarkTypes: ['word', 'sentence'],
  } as SynthesizeSpeechCommandInput
  const command = new SynthesizeSpeechCommand(input)
  client.send(command)
    .then(data => {
      if (data.AudioStream) {
        if (data.AudioStream instanceof Readable) {

          const jsonFileName = `${path.basename(fileName, path.extname(fileName))}_voice_${index}.json`
          const jsonFilePath = path.join(outputDir, jsonFileName)
          console.log(`saving json file to local as ${jsonFilePath}`)
          const file = fs.createWriteStream(jsonFilePath);
          (data.AudioStream as Readable).pipe(file)
        }
      }
    })
    .catch(error => {
      console.log(error.message)
    })
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const convertParagraphList = async (fileName: string, paragraphList: string[], outputDir: string) => {
  let index = 0
  for (const paragraph of paragraphList) {
    saveParagraphText(fileName, paragraph, index++, outputDir)
    //saveSpeech(fileName, paragraph, index++, outputDir)
    //saveSpeechMark(fileName, paragraph, index++, outputDir)
    // await sleep(500)
  }
}

const options = program.opts()
if (options.file) {
  const fileName = options.file
  let outputFoldername = './'
  if (options.output) {
    outputFoldername = options.output
  }
  console.log(`loading file ${fileName}`)
  try {
    fs.readFile(fileName, async (error, data) => {
      const root = parse(data.toString())
      // const indexedPageList = htmlElementToVirtualPage(root)
      const indexedPageList = htmlElementToGraphemes(root)
      let index = 0
      /*
      indexedPageList.forEach(line => {
        console.log(`line ${index++} ======>`)
        console.log(line)
      })
       */
      /*
      const paragraphList = htmlElementToParagraph(root)
      console.log(paragraphList)
      */
      // await convertParagraphList(fileName, paragraphList, outputFoldername)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  console.error('Usage: yarn convert -f <(x)html file path>')
}
