import React from 'react'

export default function PercentInput({label, value, onChange, name, min=0, max=100, step=0.1}){
  return (
    <label className="block">
      <div className="label mb-1">{label}</div>
      <div className="relative">
        <input
          className="input text-right"
          type="number"
          inputMode="decimal"
          pattern="[0-9]*"
          name={name}
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          onChange={(e)=> onChange?.(parseFloat(e.target.value))}
          placeholder="0"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-gray-500">%</span>
      </div>
    </label>
  )
}