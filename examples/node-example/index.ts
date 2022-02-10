import * as fs from 'fs'
import { Command } from 'commander'
import { parse } from 'node-html-parser'
import htmlElementToParagraph from './htmlElementToParagraph'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import { SynthesizeSpeechCommandInput } from '@aws-sdk/client-polly/dist-types/commands/SynthesizeSpeechCommand'
import { Readable } from 'stream'
import * as path from 'path'

const program = new Command()
program.option('-f, --file <html>', 'convert a single (x)html file')
program.option('-o, --output <folder>', 'store output mp3 files to folder')

program.parse(process.argv)

const client = new PollyClient({region: 'ca-central-1'})
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const convertParagraphList = async (fileName: string, paragraphList: string[], outputDir: string) => {
  let index = 0
  for (const paragraph of paragraphList) {
    saveSpeech(fileName, paragraph, index++, outputDir)
    await sleep(500)
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
      const paragraphList = htmlElementToParagraph(root)
      await convertParagraphList(fileName, paragraphList, outputFoldername)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  console.error('Usage: yarn convert -f <(x)html file path>')
}
