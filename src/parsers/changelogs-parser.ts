import path from 'path'
import fs from 'fs'
import { parseMarkdown, parseDate } from './markdown-parser'

const websiteChangelogFile = path.join(process.cwd(), '_changelogs/website.md')

export interface ParsedDate {
  sDate: string
  iDate: number
}

export interface ChangelogEntry {
  subject: { id: string, title: string }
  date: ParsedDate
  description: string
}

export interface GroupedChangelogEntry {
  subjects: Array<{ id: string, title: string }>
  date: ParsedDate
  description: string
}

// Use process-level cache for changelogs metadata
const CHANGELOGS_CACHE_KEY = '__changelogs_metadata_cache__'
const isCacheEnabled = false
export function getCachedWebsiteChangelog(): ChangelogEntry[] {
  // console.log('getCachedWebsiteChangelog')

  if (!isCacheEnabled) {
    // console.log('CACHE IS DISABLED')
    return getWebsiteChangelog()
  }

  // avoid re-running expensive operations when reloading page in dev mode
  if (typeof globalThis.process !== 'undefined') {
    const proc = globalThis.process as any // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!proc[CHANGELOGS_CACHE_KEY]) {
      // one-time build
      // console.log('getDemosMetadata')
      const demos = getWebsiteChangelog() // check markdown file
      proc[CHANGELOGS_CACHE_KEY] = demos
    }
    return proc[CHANGELOGS_CACHE_KEY]
  }

  throw new Error('environment has no process')
}

function getWebsiteChangelog(): ChangelogEntry[] {
  // console.log(`parsing website changelog from ${websiteChangelogFile}`)
  const fileContent = fs.readFileSync(websiteChangelogFile, 'utf8')

  // const { data, content } = matter(fileContent)
  const { data } = parseMarkdown(fileContent)

  return parseChangelog(data, 'website', websiteChangelogFile)
}

// extract changelog from frontmatter
export function parseChangelog(data: { changelog?: string[], title?: string }, id: string, filepath: string): ChangelogEntry[] {
  // console.log('parse changelog with id ', id)

  const changelog: ChangelogEntry[] = []
  if (data.changelog) {
    if (!Array.isArray(data.changelog))
      throw new Error(`changelog should be array (or omitted) in ${filepath}`)
    for (const rawEntry of data.changelog as string[]) {
      changelog.push({
        subject: { id, title: data.title ?? id },
        date: parseDate(rawEntry, 'changelog entry'),
        description: rawEntry.substring(rawEntry.indexOf(' ') + 1),
      })
    }
  }

  changelog.sort((a, b) => b.date.iDate - a.date.iDate)

  return changelog
}

// group entries with matching date and description
export function getGroupedChangelog(entries: ChangelogEntry[]): Array<ChangelogEntry | GroupedChangelogEntry> {
  // Sort entries by date descending (most recent first)
  const sorted = [...entries].sort((a, b) => b.date.iDate - a.date.iDate)

  // Group by date+description
  const result: Array<ChangelogEntry | GroupedChangelogEntry> = []
  for (const entry of sorted) {
    // Try to find a group with same date and description
    const last = result[result.length - 1]
    if (
      last
      && last.date.iDate === entry.date.iDate
      && last.description === entry.description
    ) {
      // If last is a GroupedChangelogEntry, add subject
      if ('subjects' in last) {
        last.subjects.push(entry.subject)
      }
      else {
        // Convert last (ChangelogEntry) to GroupedChangelogEntry
        result[result.length - 1] = {
          subjects: [
            last.subject,
            entry.subject,
          ],
          date: last.date,
          description: last.description,
        }
      }
    }
    else {
      result.push(entry)
    }
  }
  return result
}
