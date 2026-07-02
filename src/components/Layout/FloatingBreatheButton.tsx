import { Wind } from 'lucide-react'

interface Props {
  onClick: () => void
}

export default function FloatingBreatheButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed right-5 bottom-[92px] z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-soft active:scale-95 transition-transform"
      aria-label="呼吸一下"
    >
      <Wind size={24} strokeWidth={2} />
    </button>
  )
}
