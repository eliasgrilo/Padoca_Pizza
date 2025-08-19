import React from 'react'
const presets = { IDY:0.23, ADY:0.15, CY:0.7, SSD:0.10, LSD:0.02 }
export default function YeastPresets({onSelect}){
  return (
    <div style={{display:'flex',gap:6}}>
      {Object.keys(presets).map(k=>(
        <button key={k} className="preset" onClick={()=>onSelect(presets[k])}>{k}</button>
      ))}
    </div>
  )
}
