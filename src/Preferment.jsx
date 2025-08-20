import React from 'react'

export default function Preferment({value, onChange, data, onDataChange}){
  // value: 'None' | 'Poolish' | 'Biga' | 'Levain'
  // data: { poolish:{pct, hydration, yeastPct, time_h, temp_C}, biga:{pct, hydration, yeastPct, time_h, temp_C}, levain:{pct, hydration, inoculationPct, time_h, temp_C} }
  const types = ['None','Poolish','Biga','Levain']

  function set(key, field, val){
    onDataChange?.({
      ...data,
      [key]: { ...data[key], [field]: (Number.isNaN(val)? '' : val) }
    })
  }

  return (
    <div className="space-y-3">
      <div className="label">Tipo de Fermentação</div>
      <div className="flex flex-wrap gap-2">
        {types.map(t=>(
          <label key={t} className={"button " + (value===t? "primary" : "")}>
            <input type="radio" className="sr-only" name="prefermentType" value={t} checked={value===t} onChange={()=> onChange?.(t)} />
            {t}
          </label>
        ))}
      </div>

      {value==='Poolish' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <label className="block">
            <div className="label mb-1">Poolish (% farinha)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.poolish.pct} onChange={(e)=> set('poolish','pct', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Hidratação (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.poolish.hydration} onChange={(e)=> set('poolish','hydration', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Yeast (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.poolish.yeastPct} onChange={(e)=> set('poolish','yeastPct', parseFloat(e.target.value))} />
          </label>
        </div>
      )}

      {value==='Biga' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <label className="block">
            <div className="label mb-1">Biga (% farinha)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.biga.pct} onChange={(e)=> set('biga','pct', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Hidratação (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.biga.hydration} onChange={(e)=> set('biga','hydration', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Yeast (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.biga.yeastPct} onChange={(e)=> set('biga','yeastPct', parseFloat(e.target.value))} />
          </label>
        </div>
      )}

      {value==='Levain' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <label className="block">
            <div className="label mb-1">Levain (% farinha)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.levain.pct} onChange={(e)=> set('levain','pct', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Hidratação do levain (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.levain.hydration} onChange={(e)=> set('levain','hydration', parseFloat(e.target.value))} />
          </label>
          <label className="block">
            <div className="label mb-1">Inoculação (%)</div>
            <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={data.levain.inoculationPct} onChange={(e)=> set('levain','inoculationPct', parseFloat(e.target.value))} />
          </label>
        </div>
      )}

      {value==='None' && (
        <p className="text-sm opacity-70">Sem pré-fermento. Prosseguir com fermentação direta.</p>
      )}
    </div>
  )
}