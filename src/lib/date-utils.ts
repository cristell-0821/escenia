// src/lib/date-utils.ts

/**
 * Formatea fecha ISO para input datetime-local (sin conversión de zona horaria)
 */
export function formatDateTimeForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  
  // Extrae directamente del string ISO: "2024-03-31T10:00:00Z" → "2024-03-31T10:00"
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return ''
  
  const [, year, month, day, hours, minutes] = match
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Muestra fecha/hora en formato legible para Perú (sin conversión de zona horaria)
 * Muestra exactamente lo que guardó el usuario
 */
export function formatDateTimeDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Fecha por definir'
  
  // Extrae componentes directamente del string
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return 'Fecha inválida'
  
  const [, year, month, day, hours, minutes] = match
  
  // Formato: "31 de marzo de 2024, 10:00"
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  
  return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}, ${hours}:${minutes}`
}

/**
 * Solo fecha para displays simples
 */
export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Fecha por definir'
  
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return 'Fecha inválida'
  
  const [, year, month, day] = match
  
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  
  return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`
}