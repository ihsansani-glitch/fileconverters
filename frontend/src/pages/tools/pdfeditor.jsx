import { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// ✅ Fix PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const API = 'http://localhost:5000/api/pdf'

const NAV_TABS = [
  { id: 'Edit',        icon: '✏️', color: 'blue' },
  { id: 'Pages',       icon: '📄', color: 'purple' },
  { id: 'Annotate',    icon: '🖊',  color: 'yellow' },
  { id: 'Smart Tools', icon: '✨', color: 'green' },
  { id: 'Sign',        icon: '✍️', color: 'indigo' },
  { id: 'View',        icon: '👁',  color: 'slate' },
]

const TOOLS = {
  Edit: [
    { id:'select',   icon:'↖️', label:'Select'    },
    { id:'text',     icon:'T',  label:'Add Text'  },
    { id:'image',    icon:'🖼️', label:'Image'     },
    { id:'rect',     icon:'▭',  label:'Rectangle' },
    { id:'circle',   icon:'○',  label:'Circle'    },
    { id:'arrow',    icon:'→',  label:'Arrow'     },
    { id:'line',     icon:'╱',  label:'Line'      },
    { id:'highlight',icon:'🖍', label:'Highlight' },
    { id:'erase',    icon:'⌫',  label:'Erase'     },
  ],
  Pages: [
    { id:'add-page',    icon:'➕', label:'Add Page'     },
    { id:'duplicate',   icon:'⧉',  label:'Duplicate'    },
    { id:'delete-page', icon:'🗑️', label:'Delete Page'  },
    { id:'rotate',      icon:'↺',  label:'Rotate'       },
    { id:'extract',     icon:'📤', label:'Extract'      },
    { id:'split',       icon:'✂️', label:'Split PDF'    },
    { id:'merge',       icon:'🔗', label:'Merge PDFs'   },
    { id:'blank',       icon:'📃', label:'Blank Page'   },
    { id:'replace',     icon:'🔄', label:'Replace Page' },
  ],
  Annotate: [
    { id:'a-highlight', icon:'🖍', label:'Highlight'   },
    { id:'underline',   icon:'U̲',  label:'Underline'   },
    { id:'strikeout',   icon:'S̶',  label:'Strikeout'   },
    { id:'sticky',      icon:'📝', label:'Sticky Note' },
    { id:'comment',     icon:'💬', label:'Comment'     },
    { id:'pen',         icon:'✏️', label:'Draw Pen'    },
    { id:'callout',     icon:'📢', label:'Callout'     },
    { id:'stamp',       icon:'✔️', label:'Stamp'       },
  ],
  'Smart Tools': [
    { id:'ocr',         icon:'🔍', label:'OCR Scan'       },
    { id:'search',      icon:'🔎', label:'Search PDF'     },
    { id:'findreplace', icon:'⇄',  label:'Find & Replace' },
    { id:'ai-sum',      icon:'✨', label:'AI Summarize'   },
    { id:'ai-chat',     icon:'🤖', label:'AI Chat'        },
    { id:'tables',      icon:'⊞',  label:'Detect Tables'  },
    { id:'suggest',     icon:'💡', label:'Suggestions'    },
  ],
  Sign: [
    { id:'draw-sig',    icon:'✍️', label:'Draw Signature'   },
    { id:'upload-sig',  icon:'⬆️', label:'Upload Signature' },
    { id:'digital-sig', icon:'🔏', label:'Digital Sign'     },
    { id:'request-sig', icon:'📨', label:'Request Sign'     },
    { id:'form',        icon:'📋', label:'Create Form'      },
    { id:'checkbox',    icon:'☑️', label:'Checkbox'         },
    { id:'dropdown',    icon:'▾',  label:'Dropdown'         },
    { id:'datepicker',  icon:'📅', label:'Date Picker'      },
  ],
  View: [
    { id:'zoom-in',    icon:'+',  label:'Zoom In'      },
    { id:'zoom-out',   icon:'−',  label:'Zoom Out'     },
    { id:'fullscreen', icon:'⛶',  label:'Full Screen'  },
    { id:'two-page',   icon:'⧉',  label:'Two Page'     },
    { id:'read-mode',  icon:'📖', label:'Reading Mode' },
    { id:'bookmark',   icon:'🔖', label:'Bookmarks'    },
    { id:'fit',        icon:'⊡',  label:'Fit Page'     },
  ],
}

const TAB_COLORS = {
  Edit:        { bg:'bg-blue-600',   light:'bg-blue-50',   text:'text-blue-600',   border:'border-blue-500',   ring:'ring-blue-500'   },
  Pages:       { bg:'bg-purple-600', light:'bg-purple-50', text:'text-purple-600', border:'border-purple-500', ring:'ring-purple-500' },
  Annotate:    { bg:'bg-amber-500',  light:'bg-amber-50',  text:'text-amber-600',  border:'border-amber-500',  ring:'ring-amber-500'  },
  'Smart Tools':{ bg:'bg-green-600', light:'bg-green-50',  text:'text-green-600',  border:'border-green-500',  ring:'ring-green-500'  },
  Sign:        { bg:'bg-indigo-600', light:'bg-indigo-50', text:'text-indigo-600', border:'border-indigo-500', ring:'ring-indigo-500' },
  View:        { bg:'bg-slate-600',  light:'bg-slate-100', text:'text-slate-600',  border:'border-slate-500',  ring:'ring-slate-500'  },
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onUpload, onClose }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()
  const handle = (file) => {
    if (file?.type === 'application/pdf') onUpload(file)
    else alert('Please upload a valid PDF file.')
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">✏️</div>
              <div>
                <h2 className="text-white font-bold text-lg">PDF Editor Pro</h2>
                <p className="text-blue-200 text-xs">Upload your PDF to start editing</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">✕</button>
          </div>
        </div>
        {/* Body */}
        <div className="p-6">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
              ${dragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'}`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handle(e.target.files[0])} />
            <div className="text-5xl mb-4">📄</div>
            <p className="text-slate-800 font-bold text-lg mb-1">Drop your PDF here</p>
            <p className="text-slate-500 text-sm mb-5">or click to browse files</p>
            <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/25">
              Choose PDF File
            </div>
          </div>
          {/* Feature pills */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['✏️ Edit Text','📄 Manage Pages','🖊 Annotate','✍️ Sign','✨ AI Tools','👁 View'].map(f => (
              <span key={f} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ onClose }) {
  const [msgs, setMsgs] = useState([{ role:'ai', text:"Hi! I've analyzed your PDF. Ask me anything about it." }])
  const [input, setInput] = useState('')
  const send = () => {
    if (!input.trim()) return
    setMsgs(m => [...m,
      { role:'user', text: input },
      { role:'ai',  text: `Based on the document, here's what I found about "${input}": The document discusses this topic in detail across multiple sections with supporting data and references.` }
    ])
    setInput('')
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-green-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-bold text-sm text-slate-800">AI Chat with PDF</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-sm">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm
              ${m.role==='ai' ? 'bg-white text-slate-700 rounded-tl-sm' : 'bg-green-600 text-white rounded-tr-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send()}
          placeholder="Ask about your PDF..."
          className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200" />
        <button onClick={send} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">Send</button>
      </div>
    </div>
  )
}

// ─── Find & Replace ───────────────────────────────────────────────────────────
function FindReplace({ onClose }) {
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-slate-700">Find & Replace</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block font-medium">Find text</label>
        <input value={find} onChange={e => setFind(e.target.value)} placeholder="Search text..."
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block font-medium">Replace with</label>
        <input value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replace text..."
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
      </div>
      <div className="flex gap-2">
        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-xl font-medium transition-colors">Find Next</button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl font-medium transition-colors">Replace All</button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PdfEditor() {
  const [showUpload, setShowUpload]       = useState(true)
  const [pdfFile,   setPdfFile]           = useState(null)
  const [pdfUrl,    setPdfUrl]            = useState(null)
  const [numPages,  setNumPages]          = useState(0)
  const [pageOrder, setPageOrder]         = useState([])
  const [annotations, setAnnotations]     = useState([])
  const [activePage,  setActivePage]      = useState(0)
  const [activeNav,   setActiveNav]       = useState('Edit')
  const [activeTool,  setActiveTool]      = useState('select')
  const [zoom,        setZoom]            = useState(100)
  const [darkMode,    setDarkMode]        = useState(false)
  const [twoPage,     setTwoPage]         = useState(false)
  const [newText,     setNewText]         = useState('')
  const [fontSize,    setFontSize]        = useState(14)
  const [fontColor,   setFontColor]       = useState('#000000')
  const [fontStyle,   setFontStyle]       = useState({ bold:false, italic:false, underline:false })
  const [loading,     setLoading]         = useState(false)
  const [downloadUrl, setDownloadUrl]     = useState(null)
  const [rightPanel,  setRightPanel]      = useState('properties')
  const [sigMode,     setSigMode]         = useState(null)
  const [showFR,      setShowFR]          = useState(false)
  const [showSummary, setShowSummary]     = useState(false)
  const pageRef = useRef()

  const c = TAB_COLORS[activeNav] || TAB_COLORS['Edit']

  const handleUpload = (file) => {
    setPdfFile(file)
    setPdfUrl(URL.createObjectURL(file))
    setShowUpload(false)
    setAnnotations([])
    setDownloadUrl(null)
  }

  const onDocLoad = ({ numPages: n }) => {
    setNumPages(n)
    setPageOrder([...Array(n).keys()])
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    const order = Array.from(pageOrder)
    const [moved] = order.splice(result.source.index, 1)
    order.splice(result.destination.index, 0, moved)
    setPageOrder(order)
  }

  const handlePageClick = (e) => {
    if (activeTool !== 'text' || !newText.trim()) return
    const rect = pageRef.current.getBoundingClientRect()
    setAnnotations(prev => [...prev, {
      pageIndex: activePage,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      text: newText, fontSize, color: fontColor,
      bold: fontStyle.bold, italic: fontStyle.italic, underline: fontStyle.underline,
    }])
    setNewText('')
    setActiveTool('select')
  }

  const deletePage   = (i) => { if (pageOrder.length<=1) return alert('Cannot delete last page'); setPageOrder(prev=>prev.filter((_,idx)=>idx!==i)); if(activePage>=i&&activePage>0) setActivePage(activePage-1) }
  const duplicatePage = (i) => { const o=[...pageOrder]; o.splice(i+1,0,pageOrder[i]); setPageOrder(o) }
  const addBlankPage  = ()  => setPageOrder(prev=>[...prev,-1])

  const handleToolClick = (id) => {
    setActiveTool(id)
    if (id==='zoom-in')    { setZoom(z=>Math.min(z+10,200)); return }
    if (id==='zoom-out')   { setZoom(z=>Math.max(z-10,50));  return }
    if (id==='two-page')   { setTwoPage(t=>!t); return }
    if (id==='ai-chat')    { setRightPanel('aichat'); return }
    if (id==='findreplace'){ setShowFR(true); return }
    if (id==='ai-sum')     { setShowSummary(true); return }
    if (id==='add-page')   { addBlankPage(); return }
    if (id==='duplicate')  { duplicatePage(activePage); return }
    if (id==='delete-page'){ deletePage(activePage); return }
    if (id==='blank')      { addBlankPage(); return }
    if (id==='draw-sig')   { setSigMode('draw'); return }
    if (id==='upload-sig') { setSigMode('upload'); return }
  }

  const handleSave = async () => {
    if (!pdfFile) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('pdf', pdfFile)
      fd.append('pageOrder', JSON.stringify(pageOrder.filter(p=>p>=0)))
      fd.append('textAnnotations', JSON.stringify(annotations))
      const res  = await fetch(`${API}/save-edited-pdf`, { method:'POST', body:fd })
      const data = await res.json()
      if (data.error) alert(data.error)
      else setDownloadUrl(data.downloadUrl)
    } catch (err) { alert('Error: '+err.message) }
    setLoading(false)
  }

  const handleDownload = async () => {
    try {
      const res  = await fetch(downloadUrl)
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `edited-${Date.now()}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) { alert('Download failed: '+err.message) }
  }

  const pageW = Math.round(500 * zoom / 100)

  return (
    <div className={`min-h-screen flex flex-col ${darkMode?'bg-gray-900':'bg-slate-100'}`}>
      <div className="h-16" />

      {showUpload && <UploadModal onUpload={handleUpload} onClose={()=>window.history.back()} />}

      {pdfUrl && (
        <div className="flex flex-col flex-1" style={{height:'calc(100vh - 64px)'}}>

          {/* ── Top Nav Bar ─────────────────────────── */}
          <div className={`${darkMode?'bg-gray-800 border-gray-700':'bg-white border-slate-200'} border-b flex-shrink-0`}>
            <div className="flex items-center px-4 h-12 gap-2">

              {/* Logo */}
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200 mr-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md">PDF</div>
                <span className={`text-sm font-bold ${darkMode?'text-white':'text-slate-800'}`}>Editor Pro</span>
              </div>

              {/* Nav Tabs — each tab has its own color */}
              <div className="flex items-center gap-1">
                {NAV_TABS.map(tab => {
                  const tc = TAB_COLORS[tab.id]
                  const isActive = activeNav === tab.id
                  return (
                    <button key={tab.id} onClick={()=>setActiveNav(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border
                        ${isActive
                          ? `${tc.bg} text-white border-transparent shadow-md`
                          : `bg-transparent ${darkMode?'text-gray-300 border-gray-700 hover:bg-gray-700':'text-slate-600 border-slate-200 hover:bg-slate-50'}`
                        }`}>
                      <span>{tab.icon}</span>
                      <span>{tab.id}</span>
                    </button>
                  )
                })}
              </div>

              {/* Right actions */}
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-xs truncate max-w-[160px] ${darkMode?'text-gray-400':'text-slate-400'}`}>{pdfFile?.name}</span>
                <button onClick={()=>setDarkMode(d=>!d)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border font-medium transition-colors ${darkMode?'border-gray-600 text-gray-300 hover:bg-gray-700':'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  {darkMode?'☀ Light':'🌙 Dark'}
                </button>
                <button onClick={()=>setShowUpload(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border font-medium transition-colors ${darkMode?'border-gray-600 text-gray-300 hover:bg-gray-700':'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  📂 Open
                </button>
                {!downloadUrl
                  ? <button onClick={handleSave} disabled={loading}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-500/25 disabled:opacity-50">
                      {loading?'⏳ Saving...':'💾 Save PDF'}
                    </button>
                  : <button onClick={handleDownload}
                      className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-green-500/25">
                      ⬇ Download
                    </button>
                }
              </div>
            </div>

            {/* ── Tool Ribbon ─────────────────────────── */}
            <div className={`flex items-center px-3 h-10 gap-1 border-t ${darkMode?'bg-gray-850 border-gray-700':'bg-slate-50 border-slate-100'}`}>

              {/* Tab color indicator */}
              <div className={`w-1 h-6 rounded-full ${c.bg} mr-2`} />

              {/* Tool buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {(TOOLS[activeNav]||[]).map(tool => (
                  <button key={tool.id} onClick={()=>handleToolClick(tool.id)} title={tool.label}
                    className={`flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium transition-all border
                      ${activeTool===tool.id
                        ? `${c.bg} text-white border-transparent shadow-sm`
                        : `bg-white ${darkMode?'text-gray-300 border-gray-600 hover:bg-gray-700':'text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'} shadow-sm`
                      }`}>
                    <span className="text-sm">{tool.icon}</span>
                    <span className="hidden sm:inline">{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Text formatting (Edit tab only) */}
              {activeNav==='Edit' && (
                <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
                  <select value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}
                    className={`text-xs border rounded-lg px-1.5 h-7 ${darkMode?'bg-gray-700 border-gray-600 text-gray-200':'border-slate-200 bg-white text-slate-700'}`}>
                    {[10,11,12,14,16,18,20,24,28,32,36,48].map(s=><option key={s} value={s}>{s}px</option>)}
                  </select>
                  {[{k:'bold',l:'B'},{k:'italic',l:'I'},{k:'underline',l:'U'}].map(f=>(
                    <button key={f.k} onClick={()=>setFontStyle(prev=>({...prev,[f.k]:!prev[f.k]}))}
                      className={`w-7 h-7 rounded-lg text-xs border font-medium transition-all
                        ${fontStyle[f.k]?'bg-blue-600 text-white border-transparent':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
                        ${f.k==='bold'?'font-bold':''} ${f.k==='italic'?'italic':''} ${f.k==='underline'?'underline':''}`}>
                      {f.l}
                    </button>
                  ))}
                  <input type="color" value={fontColor} onChange={e=>setFontColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5" />
                  {activeTool==='text' && (
                    <input value={newText} onChange={e=>setNewText(e.target.value)}
                      placeholder="Type text, then click on page..."
                      className="ml-1 text-xs border border-blue-300 rounded-lg px-2 h-7 w-48 outline-none focus:ring-1 focus:ring-blue-300 bg-blue-50" />
                  )}
                </div>
              )}

              {/* Zoom */}
              <div className="ml-auto flex items-center gap-1">
                <button onClick={()=>setZoom(z=>Math.max(z-10,50))} className={`w-7 h-7 rounded-lg border text-sm font-bold ${darkMode?'border-gray-600 text-gray-300 hover:bg-gray-700':'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>−</button>
                <span className={`text-xs font-bold w-10 text-center ${darkMode?'text-gray-300':'text-slate-600'}`}>{zoom}%</span>
                <button onClick={()=>setZoom(z=>Math.min(z+10,200))} className={`w-7 h-7 rounded-lg border text-sm font-bold ${darkMode?'border-gray-600 text-gray-300 hover:bg-gray-700':'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>+</button>
              </div>
            </div>
          </div>

          {/* ── Editor Body ─────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left — Page Thumbnails */}
            <div className={`w-44 flex-shrink-0 flex flex-col border-r ${darkMode?'bg-gray-800 border-gray-700':'bg-white border-slate-200'} overflow-hidden shadow-sm`}>
              <div className={`px-3 py-2.5 flex items-center justify-between border-b ${darkMode?'border-gray-700':'border-slate-100'}`}>
                <span className={`text-xs font-bold ${darkMode?'text-gray-300':'text-slate-600'}`}>Pages · {pageOrder.length}</span>
                <button onClick={addBlankPage} className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center font-bold transition-colors">+</button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto p-2 space-y-2">
                      {pageOrder.map((pageIndex, i) => (
                        <Draggable key={`p-${i}`} draggableId={`p-${i}`} index={i}>
                          {(provided, snap) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              onClick={() => setActivePage(i)}
                              className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group
                                ${activePage===i ? 'border-blue-500 shadow-md shadow-blue-500/20' : darkMode?'border-gray-600 hover:border-gray-500':'border-slate-200 hover:border-slate-300'}
                                ${snap.isDragging?'scale-105 shadow-xl':''}`}>
                              <div className={`${darkMode?'bg-gray-700':'bg-white'} aspect-[0.707] overflow-hidden flex items-center justify-center`}>
                                {pageIndex >= 0 ? (
                                  <Document file={pdfUrl} loading={<div className="w-full h-full bg-slate-50 flex items-center justify-center"><span className="text-slate-300 text-xs">...</span></div>}>
                                    <Page pageNumber={pageIndex+1} width={132} renderAnnotationLayer={false} renderTextLayer={false} />
                                  </Document>
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${darkMode?'bg-gray-600':'bg-slate-50'}`}>
                                    <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-400'}`}>Blank</span>
                                  </div>
                                )}
                              </div>
                              <div className={`py-1 text-center text-xs font-medium ${activePage===i?'text-blue-600':'text-slate-400'}`}>{i+1}</div>
                              {/* Hover actions */}
                              <div className="absolute top-1 right-1 hidden group-hover:flex flex-col gap-0.5">
                                <button onClick={e=>{e.stopPropagation();duplicatePage(i)}} title="Duplicate"
                                  className="w-5 h-5 bg-blue-500 text-white rounded text-xs flex items-center justify-center shadow-sm">⧉</button>
                                <button onClick={e=>{e.stopPropagation();deletePage(i)}} title="Delete"
                                  className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center shadow-sm">✕</button>
                              </div>
                              {/* Drag indicator */}
                              <div className="absolute top-1 left-1 hidden group-hover:flex opacity-50">
                                <span className="text-slate-400 text-xs">⠿</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Central Canvas */}
            <div className={`flex-1 overflow-auto p-6 flex flex-col items-center gap-4 ${darkMode?'bg-gray-900':'bg-slate-100'}`}
              style={{backgroundImage: darkMode?'none':'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize:'20px 20px'}}>

              {/* Smart panels */}
              {showSummary && (
                <div className="w-full max-w-2xl bg-white border border-green-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 flex items-center justify-between border-b border-green-100">
                    <div className="flex items-center gap-2"><span>✨</span><span className="font-bold text-sm text-green-800">AI Document Summary</span></div>
                    <button onClick={()=>setShowSummary(false)} className="text-green-500 hover:text-green-700">✕</button>
                  </div>
                  <div className="p-4 space-y-3 text-xs leading-relaxed text-slate-600">
                    <p className="font-semibold text-green-700">📋 Overview</p>
                    <p>This document contains <strong>{numPages} pages</strong>. The content is well-structured with clear sections covering the main topics.</p>
                    <p className="font-semibold text-green-700">🔑 Key Points</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Main topics identified across multiple sections</li>
                      <li>Supporting data and references included on pages 2-{Math.max(2,numPages-1)}</li>
                      <li>Conclusions drawn on page {numPages}</li>
                    </ul>
                  </div>
                </div>
              )}

              {showFR && (
                <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-lg">
                  <FindReplace onClose={()=>setShowFR(false)} />
                </div>
              )}

              {/* PDF Page(s) */}
              <div className="flex gap-6">
                {[activePage, ...(twoPage && activePage+1<pageOrder.length ? [activePage+1] : [])].map((pIdx, vi) => (
                  <div key={vi}
                    ref={vi===0 ? pageRef : null}
                    onClick={vi===0 ? handlePageClick : undefined}
                    className={`relative bg-white rounded-lg shadow-2xl overflow-hidden flex-shrink-0 transition-all
                      ${activeTool==='text' && vi===0 ? 'cursor-crosshair ring-2 ring-blue-400' : ''}
                      ${sigMode && vi===0 ? 'ring-2 ring-indigo-400' : ''}`}
                    style={{width: pageW}}>

                    {pageOrder[pIdx] >= 0 ? (
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={vi===0 ? onDocLoad : undefined}
                        loading={
                          <div style={{width:pageW, height:Math.round(pageW*1.414)}}
                            className="bg-white flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-slate-400 text-xs">Loading PDF...</span>
                          </div>
                        }
                        error={
                          <div style={{width:pageW, height:Math.round(pageW*1.414)}}
                            className="bg-red-50 flex items-center justify-center">
                            <span className="text-red-400 text-xs text-center px-4">Failed to load PDF. Please try uploading again.</span>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={(pageOrder[pIdx]??0)+1}
                          width={pageW}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </Document>
                    ) : (
                      <div style={{width:pageW, height:Math.round(pageW*1.414)}}
                        className="bg-white flex items-center justify-center border border-dashed border-slate-300">
                        <span className="text-slate-300 text-sm">Blank Page</span>
                      </div>
                    )}

                    {/* Text annotations on page */}
                    {vi===0 && annotations.filter(a=>a.pageIndex===activePage).map((ann, i) => (
                      <div key={i} style={{
                        position:'absolute', left:ann.x, top:ann.y, zIndex:10,
                        fontSize:ann.fontSize, color:ann.color,
                        fontWeight:ann.bold?'bold':'normal',
                        fontStyle:ann.italic?'italic':'normal',
                        textDecoration:ann.underline?'underline':'none',
                        background:'rgba(255,255,180,0.9)',
                        padding:'2px 6px', borderRadius:4, border:'1.5px dashed #f59e0b',
                        cursor:'move', userSelect:'none', whiteSpace:'nowrap', boxShadow:'0 1px 4px rgba(0,0,0,0.1)'
                      }}>
                        {ann.text}
                        <button onClick={()=>setAnnotations(prev=>prev.filter((_,idx)=>idx!==i))}
                          style={{marginLeft:6,color:'#ef4444',fontSize:11,background:'none',border:'none',cursor:'pointer',lineHeight:1}}>✕</button>
                      </div>
                    ))}

                    {/* Signature overlay */}
                    {sigMode && vi===0 && (
                      <div className="absolute inset-0 bg-indigo-50/90 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl p-5 w-72">
                          <p className="text-indigo-700 font-bold text-sm text-center mb-3">
                            {sigMode==='draw'?'✍️ Draw Your Signature':'⬆️ Upload Signature Image'}
                          </p>
                          {sigMode==='draw' && (
                            <canvas width={250} height={90} className="bg-white border-2 border-indigo-300 rounded-xl w-full mb-3" />
                          )}
                          {sigMode==='upload' && (
                            <input type="file" accept="image/*" className="text-xs w-full mb-3 border border-slate-200 rounded-lg p-2" />
                          )}
                          <div className="flex gap-2">
                            <button onClick={()=>setSigMode(null)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold">Apply</button>
                            <button onClick={()=>setSigMode(null)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold">Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeTool==='text' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-blue-700">
                    {newText ? '📍 Click anywhere on the page to place your text' : '⌨ Type text in the toolbar above, then click on the page'}
                  </p>
                </div>
              )}
            </div>

            {/* Right Properties Panel */}
            <div className={`w-52 flex-shrink-0 flex flex-col border-l ${darkMode?'bg-gray-800 border-gray-700':'bg-white border-slate-200'} shadow-sm`}>

              {/* Panel tabs */}
              <div className={`flex border-b ${darkMode?'border-gray-700':'border-slate-100'}`}>
                {[{id:'properties',label:'⚙ Props'},{id:'aichat',label:'🤖 AI Chat'}].map(t=>(
                  <button key={t.id} onClick={()=>setRightPanel(t.id)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2
                      ${rightPanel===t.id ? 'text-blue-600 border-blue-600' : `border-transparent ${darkMode?'text-gray-400':'text-slate-400 hover:text-slate-600'}`}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {rightPanel==='aichat' ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <AIChat onClose={()=>setRightPanel('properties')} />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">

                  {/* Page info */}
                  <div className={`px-3 py-3 border-b ${darkMode?'border-gray-700':'border-slate-100'}`}>
                    <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${darkMode?'text-gray-400':'text-slate-400'}`}>Document</p>
                    <div className="space-y-1.5">
                      {[
                        {label:'Page',  val:`${activePage+1} of ${pageOrder.length}`},
                        {label:'Total', val:pageOrder.length},
                        {label:'Zoom',  val:`${zoom}%`},
                        {label:'Mode',  val:twoPage?'Two Page':'Single'},
                      ].map((r,i)=>(
                        <div key={i} className="flex justify-between items-center">
                          <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-500'}`}>{r.label}</span>
                          <span className={`text-xs font-semibold ${darkMode?'text-gray-200':'text-slate-700'}`}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text properties */}
                  {activeNav==='Edit' && (
                    <div className={`px-3 py-3 border-b ${darkMode?'border-gray-700':'border-slate-100'}`}>
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${darkMode?'text-gray-400':'text-slate-400'}`}>Text</p>
                      <div className="space-y-2">
                        <div>
                          <label className={`text-xs ${darkMode?'text-gray-400':'text-slate-500'}`}>Size</label>
                          <select value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}
                            className={`w-full mt-1 text-xs border rounded-lg px-2 h-7 ${darkMode?'bg-gray-700 border-gray-600 text-gray-200':'border-slate-200 bg-white'}`}>
                            {[10,11,12,14,16,18,20,24,28,32,36,48].map(s=><option key={s} value={s}>{s}px</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode?'text-gray-400':'text-slate-500'}`}>Color</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={fontColor} onChange={e=>setFontColor(e.target.value)}
                              className="w-8 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5" />
                            <span className={`text-xs font-mono ${darkMode?'text-gray-300':'text-slate-600'}`}>{fontColor}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[{k:'bold',l:'B'},{k:'italic',l:'I'},{k:'underline',l:'U'}].map(f=>(
                            <button key={f.k} onClick={()=>setFontStyle(prev=>({...prev,[f.k]:!prev[f.k]}))}
                              className={`flex-1 h-7 rounded-lg text-xs font-medium border transition-all
                                ${fontStyle[f.k]?'bg-blue-600 text-white border-transparent':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
                                ${f.k==='bold'?'font-bold':''} ${f.k==='italic'?'italic':''} ${f.k==='underline'?'underline':''}`}>
                              {f.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Annotations list */}
                  {annotations.length>0 && (
                    <div className={`px-3 py-3 border-b ${darkMode?'border-gray-700':'border-slate-100'}`}>
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${darkMode?'text-gray-400':'text-slate-400'}`}>
                        Added Text ({annotations.length})
                      </p>
                      <div className="space-y-1">
                        {annotations.map((ann, i)=>(
                          <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${darkMode?'bg-gray-700':'bg-slate-50'} border ${darkMode?'border-gray-600':'border-slate-200'}`}>
                            <span className={`text-xs truncate max-w-[110px] ${darkMode?'text-gray-300':'text-slate-600'}`}>{ann.text}</span>
                            <button onClick={()=>setAnnotations(prev=>prev.filter((_,idx)=>idx!==i))}
                              className="text-red-400 hover:text-red-600 text-xs ml-1 font-bold">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="px-3 py-3">
                    <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${darkMode?'text-gray-400':'text-slate-400'}`}>Quick Actions</p>
                    <div className="space-y-1">
                      {[
                        {l:'✨ AI Summarize', fn:()=>setShowSummary(true)},
                        {l:'🤖 AI Chat',      fn:()=>setRightPanel('aichat')},
                        {l:'🔎 Find & Replace',fn:()=>setShowFR(true)},
                        {l:'⧉ Duplicate Page', fn:()=>duplicatePage(activePage)},
                        {l:'➕ Add Blank Page', fn:addBlankPage},
                        {l:'🗑 Delete Page',    fn:()=>deletePage(activePage)},
                        {l:'✍️ Draw Signature', fn:()=>setSigMode('draw')},
                        {l:'⬆️ Upload Signature',fn:()=>setSigMode('upload')},
                      ].map((a,i)=>(
                        <button key={i} onClick={a.fn}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                            ${darkMode?'text-gray-300 hover:bg-gray-700':'text-slate-600 hover:bg-slate-100'}`}>
                          {a.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className={`h-7 flex items-center px-4 gap-4 border-t flex-shrink-0 ${darkMode?'bg-gray-800 border-gray-700':'bg-white border-slate-200'}`}>
            <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-400'}`}>Page {activePage+1} / {pageOrder.length}</span>
            <div className={`w-px h-3 ${darkMode?'bg-gray-600':'bg-slate-300'}`}/>
            <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-400'}`}>Tool: <span className="font-medium">{activeTool}</span></span>
            <div className={`w-px h-3 ${darkMode?'bg-gray-600':'bg-slate-300'}`}/>
            <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-400'}`}>Tab: <span className={`font-medium ${c.text}`}>{activeNav}</span></span>
            {downloadUrl && (
              <span className="text-xs text-green-600 font-semibold">✓ Saved — ready to download</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-xs ${darkMode?'text-gray-400':'text-slate-400'}`}>Zoom</span>
              <input type="range" min="50" max="200" step="10" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-20 accent-blue-600" />
              <span className={`text-xs font-bold w-9 ${darkMode?'text-gray-300':'text-slate-600'}`}>{zoom}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}