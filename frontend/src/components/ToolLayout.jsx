function ToolLayout({
  title,
  description,
  icon,
  children,
  gradient = 'from-blue-500 to-cyan-500'
}) {

  return (

    <div className="min-h-screen bg-white">

      {/* NAVBAR SPACE */}
      <div className="h-24" />

      {/* HERO */}
      <div className="min-h-[45vh] flex flex-col justify-center items-center text-center px-6 pb-10">

        {/* ICON */}
        <div className={`w-40 h-40 rounded-[40px] bg-gradient-to-r ${gradient}
          flex items-center justify-center mb-8 shadow-2xl`}>

          <img
            src={icon}
            alt={title}
            className="w-28 h-28 object-contain"
          />

        </div>

        {/* TITLE */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
          {title}
        </h1>

        {/* DESC */}
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          {description}
        </p>

      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-24">

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8">

          {children}

        </div>

      </div>

    </div>
  )
}

export default ToolLayout