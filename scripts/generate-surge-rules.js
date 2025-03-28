'use strict'

const compile = require('@adguard/hostlist-compiler')
const { join } = require('path')
const fs = require('fs-extra')
const slugify = require('@sindresorhus/slugify')

const distDir = join(__dirname, '../output/surge')
const configurations = [
  {
    name: 'Tracking Protection filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_3_Spyware/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Chinese filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_224_Chinese/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Base filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_2_Base/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'DNS filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
]

function formatRule(rule) {
  const reg = /^\|\|(.*)\^$/

  if (!reg.test(rule)) {
    return
  }

  const domain = rule.match(reg)[1]

  return '.' + domain
}

async function outputCompiled(config, compiled) {
  const fileName = `${slugify(config.name)}.txt`
  const dest = join(distDir, fileName)

  // 确保输出目录存在
  await fs.ensureDir(distDir)

  if (fs.existsSync(dest)) {
    await fs.remove(dest)
  }

  const stream = fs.createWriteStream(dest)

  for (const rule of compiled) {
    const formatted = formatRule(rule)

    if (formatted) {
      if (formatted.includes('*')) {
        console.warn('⚠️', formatted, 'is skipped because it contains *')
        continue
      }

      stream.write(formatted + '\n')
    }
  }

  stream.end()
}

async function main() {
  for (const config of configurations) {
    const compiled = await compile(config)
    await outputCompiled(config, compiled)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})