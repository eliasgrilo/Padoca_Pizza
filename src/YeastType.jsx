import React, {useState} from 'react'

const yeastMap = {
  CY: 'Compressed Yeast',
  IDY: 'Instant Dry Yeast',
  ADY: 'Active Dry Yeast',
}

export default function YeastType({value, onChange}){
  const [open, setOpen] = useState(null)

  const Item = ({code}) => (
    <button
      type="button"
      onClick={()=> { onChange?.(code); setOpen(open===code? null : code) }}
      className={"rounded-2xl border px-4 py-2 text-sm font-semibold transition " + (value===code? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30" : "border-gray-300 hover:bg-gray-50 dark:border-zinc-700")}
      aria-expanded={open===code}
      aria-controls={`desc-${code}`}
    >
      {code}
    </button>
  )
  return (
    <div className="space-y-2">
      <div className="label">Yeast Type</div>
      <div className="flex flex-wrap gap-2">
        <Item code="CY" />
        <Item code="IDY" />
        <Item code="ADY" />
      </div>
      {['CY','IDY','ADY'].map(code => (
        <div key={code} id={`desc-${code}`} className={(open===code? 'block' : 'hidden') + ' text-sm text-gray-600 dark:text-gray-300'}>
          {yeastMap[code]}
        </div>
      ))}
    </div>
  )
}