import clsx from 'clsx'

type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'

const colors: Record<Color, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ label, color = 'gray' }: { label: string; color?: Color }) {
  return (
    <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color])}>
      {label}
    </span>
  )
}
