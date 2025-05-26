import { DevServer, FileTree, generateFiles, Pipeline } from "immaculata"
import { stripTypeScriptTypes } from 'node:module'

const src = new FileTree('src', import.meta.dirname)

if (process.argv[2] === 'dev') {
  const server = new DevServer(8181)
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
