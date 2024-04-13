import type { WithScope } from 'ast-kit'
import { babelParse, walkAST } from 'ast-kit'
import type { Node } from '@babel/types'
import MagicString from 'magic-string'
import { extname } from 'pathe'
import type { Compiler, Context } from './../../types'
import { compilers } from './compilers'
import { genConsoleString, isConsoleExpression } from './common'

function getCompiler(id: string): Compiler | false {
  const urlObject = new URL(id, 'file://')
  const fileType = extname(urlObject.pathname)

  switch (fileType) {
    case '.vue':
      return 'vue'
    case '.svelte':
      return 'svelte'
    case '.js':
      return 'vanilla'
    case '.jsx':
      return 'vanilla'
    case '.ts':
      return 'vanilla'
    case '.tsx':
      return 'vanilla'
    case '.astro':
      return 'vanilla'
  }

  return false
}

export async function transform(context: Context) {
  const { code, id, options } = context
  const magicString = new MagicString(code)

  const compiler = getCompiler(id)

  if (!compiler)
    return false

  const compileResult = await compilers[compiler](context)

  const program = babelParse(compileResult.script, 'language', {
    sourceFilename: id,
    plugins: ['jsx', 'typescript'],
  })

  walkAST<WithScope<Node>>(program, {
    enter(node) {
      if (isConsoleExpression(node)) {
        const expressionStart = node.start!
        const expressionEnd = node.end!

        const originalExpression = magicString.slice(expressionStart, expressionEnd)

        if (originalExpression.includes('%c'))
          return false

        const { line, column } = node.loc!.start
        // @ts-expect-error any
        const args = node.arguments

        const argsStart = args[0].start! + compileResult.offset
        const argsEnd = args[args.length - 1].end! + compileResult.offset
        const argType = args[0].type

        const argsName = magicString.slice(argsStart, argsEnd)
          .toString()
          .replace(/`/g, '')
          .replace(/\n/g, '')
          .replace(/"/g, '')

        const originalLine = line + compileResult.line
        const originalColumn = column

        const { consoleString, _suffix } = genConsoleString({
          options,
          originalLine,
          originalColumn,
          argType,
          argsName,
          id,
        })

        consoleString && magicString.appendLeft(argsStart, consoleString)
        _suffix && magicString.appendRight(argsEnd, `,"${_suffix}"`)
      }
    },
  })

  return {
    code: magicString.toString(),
    map: magicString.generateMap({ source: id }),
  }
}