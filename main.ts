import { transformSync } from '@babel/core'
import { DevServer, FileTree, generateFiles, Pipeline } from "immaculata"
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = import.meta.dirname

const dev = process.argv[2] === 'dev' && {
  port: 8181,
  generateFiles: true,
}

const src = new FileTree('src', projectRoot)

const pkgjson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
const prefix = new URL(pkgjson.homepage).pathname.replace(/\/+$/, '')

if (dev) {
  const server = new DevServer(dev.port, { prefix })
  processSite(server)
  src.watch().on('filesUpdated', () => {
    processSite(server)
  })
}
else {
  processSite()
}

function processSite(server?: DevServer) {
  const files = Pipeline.from(src.files)

  files.with(/\.tsx?$/).do(file => {
    const result = transform(file.path, file.text)!
    file.path = file.path.replace(/\.tsx?$/, '.js')

    const mapPath = file.path + '.map'
    const sourceMapPart = '\n//# sourceMappingURL=' + prefix + mapPath
    file.text = result.code! + sourceMapPart

    files.add(mapPath, JSON.stringify(result.map))
  })

  const map = files.results()

  if (server) server.files = map

  if (!dev || dev.generateFiles) {
    rmSync('docs', { force: true, recursive: true })
    generateFiles(map)
  }

  return map
}

function transform(path: string, text: string) {
  return transformSync(text, {
    sourceMaps: true,
    filename: path,
    plugins: [
      ['@babel/plugin-transform-typescript', { isTSX: true }],
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ],
  })
}
