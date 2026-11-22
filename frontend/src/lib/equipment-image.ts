export function equipmentImageSource(value: string | null | undefined) {
  const source = value?.trim()
  if (!source) return null

  // Normalize JPEG aliases and whitespace left by older base64 image records.
  const dataUrl = source.match(/^data:image\/(jpeg|jpg|pjpeg|png|webp);base64,([\s\S]+)$/i)
  if (dataUrl) {
    const mime = ['jpg','pjpeg'].includes(dataUrl[1].toLowerCase()) ? 'jpeg' : dataUrl[1].toLowerCase()
    const payload = dataUrl[2].replace(/\s/g, '')
    return `data:image/${mime};base64,${payload}`
  }

  // Support older records that kept only the file's base64 payload.
  if (/^[A-Za-z0-9+/\r\n]+={0,2}$/.test(source)) {
    const payload = source.replace(/\s/g, '')
    const mime = payload.startsWith('/9j/') ? 'image/jpeg'
      : payload.startsWith('iVBORw0KGgo') ? 'image/png'
      : payload.startsWith('UklGR') ? 'image/webp'
      : null
    if (mime) return `data:${mime};base64,${payload}`
  }
  return null
}
