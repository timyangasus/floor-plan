export function timeGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 5) return '夜深了'
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}
