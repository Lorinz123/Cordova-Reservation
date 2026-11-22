import { useEffect, useState } from 'react'
import { equipmentImageSource } from '../../../lib/equipment-image'

export default function EquipmentImage({ imageData, alt, fallback, className }: { imageData: string | null; alt: string; fallback?: string | null; className: string }) {
  const [failed, setFailed] = useState(false)
  const source = equipmentImageSource(imageData)
  useEffect(() => setFailed(false), [imageData])

  if (source && !failed) return <img className={className} src={source} alt={alt} onError={() => setFailed(true)} />
  if (fallback) return <img className={className} src={fallback} alt={alt} />
  return <span className="font-serif text-3xl text-[#900000]" aria-hidden="true">{alt.charAt(0).toUpperCase()}</span>
}
