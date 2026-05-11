/**
 * Utilidades y funciones auxiliares
 */

/**
 * Formatear fecha
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Truncar texto
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Slug para URLs
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Capitalizar primera letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Combinar clases CSS
 */
export function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Delay/Sleep
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Genera un color aleatorio
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Obtener parámetro de URL
 */
export function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  return params.get(param)
}
