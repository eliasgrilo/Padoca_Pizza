import React from 'react'
export default function Stepper({value, onChange, min=1, step=1}){
  const dec = ()=> onChange(Math.max(min, Number(value) - step))
  const inc = ()=> onChange(Number(value) + step)
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <button onClick={dec} className="btn small">−</button>
      <div style={{minWidth:80,textAlign:'center',fontWeight:700}}>{value}</div>
      <button onClick={inc} className="btn small">+</button>
    </div>
  )
}
