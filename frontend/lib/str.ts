export function toSlug(input: string) {
  return input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function toKebabCase(input: string) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export function toSingular(word: string) {
  switch (word.toLowerCase()) {
    case 'accessories':
      return 'Accessory'
    case 'tops':
      return 'Top'
    case 'bottoms':
      return 'Bottom'
    default:
      return word
  }
}