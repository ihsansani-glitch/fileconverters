import { Link } from 'react-router-dom'

const colorClasses = {
  red: {
    border: 'hover:border-red-500',
    shadow: 'hover:shadow-red-500/10',
    bg: 'bg-red-500/20',
    bgHover: 'group-hover:bg-red-500/30',
    text: 'text-red-400',
  },
  blue: {
    border: 'hover:border-blue-500',
    shadow: 'hover:shadow-blue-500/10',
    bg: 'bg-blue-500/20',
    bgHover: 'group-hover:bg-blue-500/30',
    text: 'text-blue-400',
  },
  green: {
    border: 'hover:border-green-500',
    shadow: 'hover:shadow-green-500/10',
    bg: 'bg-green-500/20',
    bgHover: 'group-hover:bg-green-500/30',
    text: 'text-green-400',
  },
  purple: {
    border: 'hover:border-purple-500',
    shadow: 'hover:shadow-purple-500/10',
    bg: 'bg-purple-500/20',
    bgHover: 'group-hover:bg-purple-500/30',
    text: 'text-purple-400',
  },
}

function ToolCard({ title, description, icon, link, color = 'red' }) {
  const styles = colorClasses[color] || colorClasses.red

  return (
    <Link to={link}>
      <div
        className={`bg-slate-800 border border-slate-700 rounded-xl p-6 
        ${styles.border} ${styles.shadow}
        hover:shadow-lg transition-all duration-300 cursor-pointer 
        group hover:-translate-y-2`}
      >
        <div
          className={`w-12 h-12 ${styles.bg} rounded-lg flex items-center justify-center mb-4 ${styles.bgHover} transition-colors`}
        >
          <span className="text-2xl">{icon}</span>
        </div>

        <h3 className="text-white font-semibold text-lg mb-2">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>

        <div className={`mt-4 ${styles.text} text-sm font-medium flex items-center space-x-1`}>
          <span>Open Tool</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  )
}

export default ToolCard