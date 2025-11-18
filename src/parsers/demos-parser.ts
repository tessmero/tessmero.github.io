import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { ChangelogEntry, parseChangelog, ParsedDate } from './changelogs-parser'
import { parseDate, parseMarkdown } from './markdown-parser'

const demosDir = path.join(process.cwd(), '_demos')
const zipsDir = path.join(process.cwd(), '_zips')
const outputDir = path.join(process.cwd(), 'public/iframe')

// properties for one demo
export interface DemoProps {
  // filename without extension
  id: string

  // frontmatter
  title: string
  date: ParsedDate
  lastUpdated?: ParsedDate
  source?: string
  changelog: ChangelogEntry[]
  techs?: string[]
  sound?: boolean
  music?: boolean
  hasReports?: boolean
  hidden?: boolean

  // whatever is below frontmatter
  content: string
}

// Use process-level cache for demos metadata
const DEMOS_CACHE_KEY = '__demos_metadata_cache__'
const isCacheEnabled = true
export function getCachedDemos(): DemoProps[] {
  // console.log('getCachedDemos')

  if (!isCacheEnabled) {
    // console.log('CACHE IS DISABLED')
    const demos = getDemosMetadata() // check markdown files
    extractDemoZips(demos) // validate zips and extract assets
    return demos
  }

  // avoid re-running expensive operations when reloading page in dev mode
  if (typeof globalThis.process !== 'undefined') {
    const proc = globalThis.process as any // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!proc[DEMOS_CACHE_KEY]) {
      // one-time build
      // console.log('getDemosMetadata')
      const demos = getDemosMetadata() // check markdown files
      extractDemoZips(demos) // validate zips and extract assets
      proc[DEMOS_CACHE_KEY] = demos
    }
    return proc[DEMOS_CACHE_KEY]
  }

  throw new Error('environment has no process')
  // // fallback for environments without process
  // console.log('getCachedDemos EXPENSIVE FALLBACK')
  // return getDemosMetadata();
}

// get metadata from markdown files
export function getDemosMetadata(): DemoProps[] {
  const files = fs.readdirSync(demosDir)
  return files.map((filename) => {
    // console.log(`parsing demo metadata from ${filename}`)

    const id = filename.split('.')[0]
    const filePath = path.join(demosDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = parseMarkdown(fileContent)

    // console.log(JSON.stringify(data))

    // // parse demo dates
    // const date = parseDate(data.date, 'date value')
    // let lastUpdated: Date | undefined = undefined;
    // if (data.lastUpdated) {
    //     lastUpdated = parseDate(data.lastUpdated, 'lastUpdated value')
    // }

    // parse demo changelog
    const changelog = parseChangelog(data, id, filePath)

    return {
      id,
      title: data.title,
      date: parseDate(data.date, `demo date ${id}`),
      lastUpdated: data.lastUpdated ? parseDate(data.lastUpdated, `demo lastUpdated ${id}`) : undefined,
      changelog,
      source: data.source,
      techs: data.techs,
      sound: data.sound,
      hidden: data.hidden,
      music: data.music,
      hasReports: data.hasReports,
      content,
    } as DemoProps
  })
}
// get metadata from markdown files
export function extractDemoZips(demos: DemoProps[]) {
  const zips = fs.readdirSync(zipsDir)

  // console.log(JSON.stringify(zips))

  // assert zip filenames match demo IDs (no extra zips, no missing zips)
  const demoIds = new Set(demos.map(d => d.id + '.zip'))
  const zipSet = new Set(zips)
  // Check for missing zips
  const missing = demos.filter(d => !zipSet.has(d.id + '.zip'))
  if (missing.length > 0) {
    throw new Error('Missing zip files for demos: ' + missing.map(d => d.id).join(', '))
  }
  // Check for extra zips
  const extra = zips.filter(z => !demoIds.has(z))
  if (extra.length > 0) {
    throw new Error('Extra zip files found: ' + extra.join(', '))
  }

  //   // delete output dir if it exists
  //   if (fs.existsSync(outputDir)) {
  //     fs.rmSync(outputDir, { recursive: true, force: true });
  //   }

  // create output dir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // extract zips to output dir, creating a new subdir for each demo
  demos.forEach((demo) => {
    const zipPath = path.join(zipsDir, demo.id + '.zip')
    // console.log(`checking if zip was updated: ${zipPath}`)
    const demoOutDir = path.join(outputDir, demo.id)
    const zipStat = fs.statSync(zipPath)
    let shouldExtract = false
    if (!fs.existsSync(demoOutDir)) {
      shouldExtract = true
    }
    else {
      const outStat = fs.statSync(demoOutDir)
      if (zipStat.mtime > outStat.mtime) {
        //  zip is newer, Remove old output dir
        fs.rmSync(demoOutDir, { recursive: true, force: true })
        shouldExtract = true
      }
    }
    if (shouldExtract) {
      console.log(`extracting updated zip: ${zipPath}`)
      fs.mkdirSync(demoOutDir, { recursive: true })
      const zip = new AdmZip(zipPath)
      zip.extractAllTo(demoOutDir, true)
    }
  })
}
