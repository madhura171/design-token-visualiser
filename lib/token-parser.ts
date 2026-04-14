// Supports W3C Design Token format and Figma Tokens Plugin export format

export type TokenCategory = 'colors' | 'typography' | 'spacing' | 'borderRadius' | 'shadows' | 'other'

export interface ColorToken {
  name: string
  value: string
  path: string[]
}

export interface TypographyToken {
  name: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  path: string[]
}

export interface SpacingToken {
  name: string
  value: string
  pxValue: number
  path: string[]
}

export interface BorderRadiusToken {
  name: string
  value: string
  pxValue: number
  path: string[]
}

export interface ShadowToken {
  name: string
  value: string
  path: string[]
}

export interface OtherToken {
  name: string
  value: string
  path: string[]
}

export interface ParsedTokens {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
  borderRadius: BorderRadiusToken[]
  shadows: ShadowToken[]
  other: OtherToken[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isColorValue(value: string): boolean {
  if (typeof value !== 'string') return false
  const v = value.trim()
  return (
    v.startsWith('#') ||
    v.startsWith('rgb') ||
    v.startsWith('hsl') ||
    v.startsWith('oklch') ||
    /^[a-zA-Z]+$/.test(v) // named colors like "red", "blue"
  )
}

function parsePx(value: string): number {
  if (!value) return 0
  const n = parseFloat(String(value))
  if (isNaN(n)) return 0
  // rem → px (assume 16px base)
  if (String(value).includes('rem')) return n * 16
  return n
}

function normaliseValue(value: unknown): string {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value)
}

// Detect if a key/path hints at a category
function pathHints(path: string[]): TokenCategory | null {
  const joined = path.join('/').toLowerCase()
  if (/(color|colour|palette|fill|stroke|background|bg|fg|foreground|text|border|shadow|surface|brand|neutral|gray|grey|primary|secondary|accent)/.test(joined)) return 'colors'
  if (/(font|typography|text-style|typeface|heading|body)/.test(joined)) return 'typography'
  if (/(spacing|space|gap|padding|margin|size|width|height|distance)/.test(joined)) return 'spacing'
  if (/(radius|rounded|corner|border-radius)/.test(joined)) return 'borderRadius'
  if (/(shadow|elevation|drop-shadow)/.test(joined)) return 'shadows'
  return null
}

// ─── W3C Token Format ───────────────────────────────────────────────────────
// { "$type": "color", "$value": "#fff" }

function isW3CToken(node: Record<string, unknown>): boolean {
  return '$value' in node
}

function getW3CType(node: Record<string, unknown>): string | undefined {
  return typeof node['$type'] === 'string' ? (node['$type'] as string) : undefined
}

// ─── Figma Tokens Plugin format ─────────────────────────────────────────────
// { "type": "color", "value": "#fff" }

function isFigmaToken(node: Record<string, unknown>): boolean {
  return 'value' in node && ('type' in node || typeof node['value'] !== 'object')
}

function getFigmaType(node: Record<string, unknown>): string | undefined {
  return typeof node['type'] === 'string' ? (node['type'] as string) : undefined
}

// ─── Core recursive walker ───────────────────────────────────────────────────

function walkTokens(
  obj: unknown,
  path: string[],
  result: ParsedTokens,
): void {
  if (typeof obj !== 'object' || obj === null) return

  const node = obj as Record<string, unknown>

  // Skip W3C metadata fields
  const isW3C = isW3CToken(node)
  const isFigma = !isW3C && isFigmaToken(node)

  if (isW3C || isFigma) {
    const rawValue = isW3C ? node['$value'] : node['value']
    const typeHint = isW3C ? getW3CType(node) : getFigmaType(node)
    const name = path[path.length - 1] ?? 'unknown'
    const value = normaliseValue(rawValue)

    categoriseToken({ name, value, path, typeHint, rawValue, result })
    return
  }

  // Recurse into children
  for (const key of Object.keys(node)) {
    if (key.startsWith('$')) continue // skip W3C meta
    walkTokens(node[key], [...path, key], result)
  }
}

interface CategoriseArgs {
  name: string
  value: string
  path: string[]
  typeHint?: string
  rawValue: unknown
  result: ParsedTokens
}

function categoriseToken({ name, value, path, typeHint, rawValue, result }: CategoriseArgs): void {
  const type = typeHint?.toLowerCase() ?? ''
  const pathHint = pathHints(path)

  // ── Colors ──
  if (
    type === 'color' ||
    type === 'colour' ||
    (pathHint === 'colors' && isColorValue(value)) ||
    (!typeHint && isColorValue(value) && !type.includes('shadow'))
  ) {
    result.colors.push({ name, value, path })
    return
  }

  // ── Typography ──
  if (type === 'typography' || type === 'fontfamily' || type === 'fontsize' || type === 'fontweight' || type === 'lineheight' || type === 'letterspacing' || pathHint === 'typography') {
    // If the value is a composite object (W3C typography)
    if (typeof rawValue === 'object' && rawValue !== null) {
      const tv = rawValue as Record<string, unknown>
      result.typography.push({
        name,
        path,
        fontFamily: tv['fontFamily'] ? normaliseValue(tv['fontFamily']) : undefined,
        fontSize: tv['fontSize'] ? normaliseValue(tv['fontSize']) : undefined,
        fontWeight: tv['fontWeight'] ? normaliseValue(tv['fontWeight']) : undefined,
        lineHeight: tv['lineHeight'] ? normaliseValue(tv['lineHeight']) : undefined,
        letterSpacing: tv['letterSpacing'] ? normaliseValue(tv['letterSpacing']) : undefined,
      })
    } else {
      // Single-property font token
      const partial: TypographyToken = { name, path }
      if (type === 'fontfamily') partial.fontFamily = value
      else if (type === 'fontsize') partial.fontSize = value
      else if (type === 'fontweight') partial.fontWeight = value
      else if (type === 'lineheight') partial.lineHeight = value
      else if (type === 'letterspacing') partial.letterSpacing = value
      else partial.fontSize = value
      result.typography.push(partial)
    }
    return
  }

  // ── Shadows ──
  if (type === 'shadow' || type === 'boxshadow' || type === 'dropshadow' || pathHint === 'shadows') {
    result.shadows.push({ name, value, path })
    return
  }

  // ── Border Radius ──
  if (type === 'borderradius' || pathHint === 'borderRadius') {
    result.borderRadius.push({ name, value, pxValue: parsePx(value), path })
    return
  }

  // ── Spacing ──
  if (type === 'spacing' || type === 'dimension' || type === 'size' || pathHint === 'spacing') {
    result.spacing.push({ name, value, pxValue: parsePx(value), path })
    return
  }

  // ── Fallback: guess from value ──
  const pxV = parsePx(value)
  if (value.includes('px') || value.includes('rem') || value.includes('em')) {
    result.spacing.push({ name, value, pxValue: pxV, path })
    return
  }

  result.other.push({ name, value, path })
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function parseTokenFile(raw: string): ParsedTokens {
  const result: ParsedTokens = {
    colors: [],
    typography: [],
    spacing: [],
    borderRadius: [],
    shadows: [],
    other: [],
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw new Error('Invalid JSON — please upload a valid tokens.json file.')
  }

  walkTokens(json, [], result)

  // Deduplicate by path string
  const dedup = <T extends { path: string[] }>(arr: T[]): T[] => {
    const seen = new Set<string>()
    return arr.filter(t => {
      const key = t.path.join('/')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  return {
    colors: dedup(result.colors),
    typography: dedup(result.typography),
    spacing: dedup(result.spacing).sort((a, b) => a.pxValue - b.pxValue),
    borderRadius: dedup(result.borderRadius).sort((a, b) => a.pxValue - b.pxValue),
    shadows: dedup(result.shadows),
    other: dedup(result.other),
  }
}

export function totalTokenCount(tokens: ParsedTokens): number {
  return (
    tokens.colors.length +
    tokens.typography.length +
    tokens.spacing.length +
    tokens.borderRadius.length +
    tokens.shadows.length +
    tokens.other.length
  )
}
