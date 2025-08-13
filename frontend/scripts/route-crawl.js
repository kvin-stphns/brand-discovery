#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const appDir = path.resolve(__dirname, '..', 'app')
const docsDir = path.resolve(__dirname, '..', '..', 'docs', 'QA')
const reportFile = path.join(docsDir, 'ROUTES_REPORT.md')

function collectRoutes(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const routes = []
  for (const e of entries) {
    if (e.name.startsWith('(')) continue // group folders
    if (e.isDirectory()) {
      const seg = e.name.startsWith('[') ? `${e.name}` : `${e.name}`
      const subBase = path.join(base, seg)
      // page.tsx under this folder?
      const pageTsx = path.join(dir, e.name, 'page.tsx')
      const pageJsx = path.join(dir, e.name, 'page.jsx')
      const pageJs = path.join(dir, e.name, 'page.js')
      if (fs.existsSync(pageTsx) || fs.existsSync(pageJsx) || fs.existsSync(pageJs)) {
        routes.push('/' + subBase.replace(/\\/g, '/'))
      }
      routes.push(...collectRoutes(path.join(dir, e.name), subBase))
    } else if (e.isFile() && e.name === 'page.tsx' && base) {
      routes.push('/' + base.replace(/\\/g, '/'))
    }
  }
  return Array.from(new Set(routes)).sort()
}

function main() {
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })
  const routes = collectRoutes(appDir)
  const md = ['# Routes Report', '', ...routes.map((r) => `- ${r}`)].join('\n')
  fs.writeFileSync(reportFile, md)
  // eslint-disable-next-line no-console
  console.log(`Wrote ${routes.length} routes to ${reportFile}`)
}

main()