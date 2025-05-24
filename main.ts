import { DevServer, FileTree, generateFiles, Pipeline } from "immaculata"
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { join } from 'node:path'

const isDev = process.argv[2] === 'dev'

const src = new FileTree('src', import.meta.dirname)

const pkgjson = JSON.parse(readFileSync(join(import.meta.dirname, 'package.json'), 'utf8'))
const prefix = new URL(pkgjson.homepage).pathname.replace(/\/+$/, '')

if (isDev) {
  const server = new DevServer(8181, { prefix })
  server.files = processSite()

  src.watch().on('filesUpdated', () => {
    server.files = processSite()
  })
}
else {
  generateFiles(processSite(), { parent: import.meta.dirname })
}

function processSite() {
  const files = Pipeline.from(src.files)

  files.with(/\.tsx?$/).do(file => {
    file.text = stripTypeScriptTypes(file.text, { mode: 'transform', sourceMap: true })
    file.path = file.path.replace(/\.tsx?$/, '.js')
  })

  return files.results()
}
