import React, { useState, useMemo, useEffect, useRef } from 'react'
import PercentInput from './PercentInput.jsx'
import YeastType from './YeastType.jsx'
import Preferment from './Preferment.jsx'
import { loadAllRecipes, saveAllRecipes } from './storage.js'

export default function App(){
  const [inputs, setInputs] = useState({
    flour: 100,
    water: 70,
    sugar: 0,
    salt: 2.5,
    oliveOil: 0,
    oil: 0,
    milk: 0,
    butter: 0,
    diastatic: 0,
    RT_h: 6,
    RT_C: 21,
    CT_h: 48,
    CT_C: 4,
    doughBalls: 1,
    ballWeight: 350,
    yeastType: {
      ADY: { yeastPct: 0.04 },
      IDY: { yeastPct: 0.12 },
      CY: { yeastPct: 0.05 },
    },
    prefermentType: 'None',
    preferment: {
      poolish: { pct: 30, hydration: 100, yeastPct: 0.05, time_h: 12, temp_C: 22 },
      biga: { pct: 30, hydration: 50, yeastPct: 0.05, time_h: 16, temp_C: 18 },
      levain: { pct: 20, hydration: 100, inoculationPct: 20, time_h: 12, temp_C: 24 },
    },
  })

  const [recipes, setRecipes] = useState({})
  const fileRef = useRef(null)

  useEffect(()=>{ setRecipes(loadAllRecipes()) },[])

  function update(key, val){
    setInputs(prev => ({...prev, [key]: (Number.isNaN(val)? '' : val)}))
  }
  function updatePrefermentData(next){
    setInputs(prev => ({...prev, preferment: next}))
  }
    function updateYeastData(next){
    setInputs(prev => ({...prev, yeastType: next}))
  }

  const totalPct = useMemo(()=> {
    const p = (n)=> Number(n)||0
    return 100 + p(inputs.water)+p(inputs.sugar)+p(inputs.salt)+p(inputs.oliveOil)+p(inputs.oil)+p(inputs.milk)+p(inputs.yeastPct)
  }, [inputs])

  const totalDoughWeight = useMemo(()=> {
    const nBalls = Number(inputs.doughBalls)||0
    const w = Number(inputs.ballWeight)||0
    return nBalls * w
  }, [inputs.doughBalls, inputs.ballWeight])

  const flourWeight = useMemo(()=> {
    const total = Number(totalDoughWeight)||0
    const t = Number(totalPct)||100
    if(t<=0) return 0
    return total * 100 / t
  }, [totalDoughWeight, totalPct])

  const grams = useMemo(()=>{
    const f = flourWeight
    const g = (pct)=> f * (Number(pct)||0) / 100
    return {
      flour: f,
      water: g(inputs.water),
      sugar: g(inputs.sugar),
      salt: g(inputs.salt),
      oliveOil: g(inputs.oliveOil),
      oil: g(inputs.oil),
      milk: g(inputs.milk),
      yeast: g(inputs.yeastPct),
      total: f + g(inputs.water)+g(inputs.sugar)+g(inputs.salt)+g(inputs.oliveOil)+g(inputs.oil)+g(inputs.milk)+g(inputs.yeastPct)
    }
  }, [flourWeight, inputs])

  const hydration = useMemo(()=> {
    const w = Number(inputs.water)||0
    const milk = Number(inputs.milk)||0
    return w + milk
  }, [inputs.water, inputs.milk])

  // Save / Load logic
  function saveRecipe(){
    const name = prompt('Nome da receita:')
    if(!name) return
    const next = {...recipes, [name]: inputs}
    setRecipes(next)
    saveAllRecipes(next)
    alert('Receita salva.')
  }
  function loadRecipe(name){
    const r = recipes[name]
    if(!r) return
    setInputs(r)
  }
  function deleteRecipe(name){
    if(!confirm(`Excluir receita "${name}"?`)) return
    const next = {...recipes}
    delete next[name]
    setRecipes(next)
    saveAllRecipes(next)
  }
  function renameRecipe(oldName){
    const newName = prompt('Novo nome:', oldName)
    if(!newName || newName===oldName) return
    const next = {...recipes}
    next[newName] = next[oldName]
    delete next[oldName]
    setRecipes(next)
    saveAllRecipes(next)
  }
  function exportJSON(){
    const data = JSON.stringify({inputs, recipes}, null, 2)
    const blob = new Blob([data], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'padoca_pizza_recipes.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  function importJSON(e){
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try{
        const parsed = JSON.parse(String(evt.target.result||'{}'))
        if(parsed.inputs) setInputs(parsed.inputs)
        if(parsed.recipes){
          setRecipes(parsed.recipes)
          saveAllRecipes(parsed.recipes)
        }
        alert('Importação concluída.')
      }catch(err){ alert('Arquivo inválido.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }
  function clearForm(){
    setInputs({
      flour: 100, water: 60, sugar: 2, salt: 2.5, oliveOil: 1.5, oil: 0, milk: 0,
      yeastPct: 0.2, yeastType: 'IDY', RT_h: 2, RT_C: 24, CT_h: 24, CT_C: 4,
      doughBalls: 6, ballWeight: 260, prefermentType: 'None',
      preferment: {
        poolish: { pct: 30, hydration: 100, yeastPct: 0.05, time_h: 12, temp_C: 22 },
        biga: { pct: 30, hydration: 50, yeastPct: 0.05, time_h: 16, temp_C: 18 },
        levain: { pct: 20, hydration: 100, inoculationPct: 20, time_h: 12, temp_C: 24 },
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 text-gray-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-gray-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Padoca Pizza</h1>
          <div className="flex items-center gap-2">
            <a href="https://github.com/eliasgrilo/Padoca_Pizza" className="button" target="_blank" rel="noreferrer">Original</a> 
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importJSON} />
          </div>
        </header>

        {/* Porcionamento */}
        <section className="card">
          <h2 className="section-title">Porcionamento</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="label mb-1">Dough Balls</div>
              <input className="input text-right" type="number" inputMode="numeric" pattern="[0-9]*" value={inputs.doughBalls} onChange={(e)=> update('doughBalls', parseFloat(e.target.value))} />
            </label>
            <label className="block">
              <div className="label mb-1">Ball Weight (g)</div>
              <input className="input text-right" type="number" inputMode="decimal" pattern="[0-9]*" value={inputs.ballWeight} onChange={(e)=> update('ballWeight', parseFloat(e.target.value))} />
            </label>
          </div>
        </section>

        {/* Tipo de Fermentação (None, Poolish, Biga, Levain) com suas células */}
        <section className="card">
          <h2 className="section-title">Tipo de Fermentação</h2>
          <Preferment
            value={inputs.prefermentType}
            onChange={(t)=> update('prefermentType', t)}
            data={inputs.preferment}
            onDataChange={updatePrefermentData}
          />
        </section>

        {/* Categoria 1: Ingredientes */}
        <section className="card">
          <h2 className="section-title">Ingredientes</h2>
          <div className="grid-col">
            <PercentInput label="Water (%)" value={inputs.water} onChange={(v)=> update('water', v)} name="water" />
            <PercentInput label="Salt (%)" value={inputs.salt} onChange={(v)=> update('salt', v)} name="salt" />
            <PercentInput label="Olive Oil (%)" value={inputs.oliveOil} onChange={(v)=> update('oliveOil', v)} name="oliveOil" />      
          </div>
        </section>

        {/* Categoria 1: Ingredientes */}
        <section className="card">
          <h2 className="section-title">Ingredientes</h2>
          <div className="grid-col">

            <PercentInput label="Sugar (%)" value={inputs.sugar} onChange={(v)=> update('sugar', v)} name="sugar" />
            <PercentInput label="Oil (%)" value={inputs.oil} onChange={(v)=> update('oil', v)} name="oil" />
            <PercentInput label="Milk (%)" value={inputs.milk} onChange={(v)=> update('milk', v)} name="milk" />
            <PercentInput label="Butter (%)" value={inputs.butter} onChange={(v)=> update('butter', v)} name="butter" />
            
            <PercentInput label="Diastatic Malt (%)" value={inputs.diastatic} onChange={(v)=> update('diastatic', v)} name="diastatic" />        
          </div>
        </section>

        {/* Tipo de Fermentação (None, Poolish, Biga, Levain) com suas células */}
        <section className="card">
          <h2 className="section-title">Yeast Type</h2>
          <YeastType
            value={inputs.prefermentType}
            onChange={(t)=> update('prefermentType', t)}
            data={inputs.yeastType}
            onDataChange={updateYeastData}
          />
        </section>

        {/* Categoria 2: Time | Temperature */}
        <section className="card">
          <h2 className="section-title">Maturação</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="block">
              <div className="label mb-1">RT leavening (h)</div>
              <input className="input text-right" type="number" inputMode="numeric" pattern="[0-9]*" value={inputs.RT_h} onChange={(e)=> update('RT_h', parseFloat(e.target.value))} />
            </label>
            <label className="block">
              <div className="label mb-1">RT °C</div>
              <input className="input text-right" type="number" inputMode="numeric" pattern="[0-9]*" value={inputs.RT_C} onChange={(e)=> update('RT_C', parseFloat(e.target.value))} />
            </label>
          </div>
        </section>

        {/* Categoria 2: Time | Temperature */}
        <section className="card">
          <h2 className="section-title">Fermentação</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="block">
              <div className="label mb-1">CT leavening (h)</div>
              <input className="input text-right" type="number" inputMode="numeric" pattern="[0-9]*" value={inputs.CT_h} onChange={(e)=> update('CT_h', parseFloat(e.target.value))} />
            </label>
            <label className="block">
              <div className="label mb-1">CT °C</div>
              <input className="input text-right" type="number" inputMode="numeric" pattern="[0-9]*" value={inputs.CT_C} onChange={(e)=> update('CT_C', parseFloat(e.target.value))} />
            </label>
          </div>
        </section>  

        {/* Ferramentas + Resumo */}
        <section className="card">
          <h2 className="section-title">Ferramentas</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <button className="button primary" onClick={saveRecipe}>Salvar</button>
            <button className="button" onClick={()=> fileRef.current?.click()}>Carregar</button>
            <button className="button" onClick={clearForm}>Limpar</button>
            <button className="button" onClick={exportJSON}>Exportar JSON</button>
            <button className="button" onClick={()=> fileRef.current?.click()}>Importar JSON</button>
          </div>
        </section>

        {/* Receitas Salvas */}
        <section className="card">
          <h2 className="section-title">Receitas Salvas</h2>
          {Object.keys(recipes).length===0 ? (
            <p className="text-sm opacity-70">Nenhuma receita salva ainda.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(recipes).map(([name]) => (
                <li key={name} className="flex items-center justify-between gap-2 rounded-xl border p-2 dark:border-zinc-700">
                  <div className="font-medium">{name}</div>
                  <div className="flex items-center gap-2">
                    <button className="button primary" onClick={()=> loadRecipe(name)}>Carregar</button>
                    <button className="button" onClick={()=> renameRecipe(name)}>Renomear</button>
                    <button className="button" onClick={()=> deleteRecipe(name)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Ferramentas + Resumo */}
        <section className="card">
          <h2 className="section-title">Proporções</h2>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <h3 className="mb-2 text-base font-semibold">Resumo</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="opacity-70">Hydration (água+leite)</dt>
              <dd className="text-right font-semibold">{(Number.isFinite(hydration)? hydration.toFixed(1) : '—')}%</dd>
              <dt className="opacity-70">Salt</dt>
              <dd className="text-right font-semibold">{(Number(inputs.salt)||0).toFixed(2)}%</dd>
              <dt className="opacity-70">Sugar</dt>
              <dd className="text-right font-semibold">{(Number(inputs.sugar)||0).toFixed(2)}%</dd>
              <dt className="opacity-70">Oils (olive+oil)</dt>
              <dd className="text-right font-semibold">{((Number(inputs.oliveOil)||0) + (Number(inputs.oil)||0)).toFixed(2)}%</dd>
              <dt className="opacity-70">Yeast</dt>
              <dd className="text-right font-semibold">{(Number(inputs.yeastPct)||0).toFixed(3)}%</dd>
              <dt className="opacity-70">Total %</dt>
              <dd className="text-right font-semibold">{(Number(totalPct)||0).toFixed(3)}%</dd>
            </dl>
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <h3 className="mb-2 text-base font-semibold">Resumo</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="opacity-70">Total massa (g)</div><div className="text-right font-semibold">{(Number(grams.total)||0).toFixed(0)}</div>
              <div className="opacity-70">Farinha (g)</div><div className="text-right font-semibold">{(Number(grams.flour)||0).toFixed(0)}</div>
              <div className="opacity-70">Água (g)</div><div className="text-right font-semibold">{(Number(grams.water)||0).toFixed(0)}</div>
              <div className="opacity-70">Leite (g)</div><div className="text-right font-semibold">{(Number(grams.milk)||0).toFixed(0)}</div>
              <div className="opacity-70">Açúcar (g)</div><div className="text-right font-semibold">{(Number(grams.sugar)||0).toFixed(0)}</div>
              <div className="opacity-70">Sal (g)</div><div className="text-right font-semibold">{(Number(grams.salt)||0).toFixed(0)}</div>
              <div className="opacity-70">Azeite (g)</div><div className="text-right font-semibold">{(Number(grams.oliveOil)||0).toFixed(0)}</div>
              <div className="opacity-70">Óleo (g)</div><div className="text-right font-semibold">{(Number(grams.oil)||0).toFixed(0)}</div>
              <div className="opacity-70">Fermento (g)</div><div className="text-right font-semibold">{(Number(grams.yeast)||0).toFixed(1)}</div>
            </div>
          </div>
        </section>

        {/* Ferramentas + Resumo */}
        <section className="card">
          <h2 className="section-title"></h2>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <h3 className="mb-2 text-base font-semibold">Resumo</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="opacity-70">Total massa (g)</div><div className="text-right font-semibold">{(Number(grams.total)||0).toFixed(0)}</div>
              <div className="opacity-70">Farinha (g)</div><div className="text-right font-semibold">{(Number(grams.flour)||0).toFixed(0)}</div>
              <div className="opacity-70">Água (g)</div><div className="text-right font-semibold">{(Number(grams.water)||0).toFixed(0)}</div>
              <div className="opacity-70">Leite (g)</div><div className="text-right font-semibold">{(Number(grams.milk)||0).toFixed(0)}</div>
              <div className="opacity-70">Açúcar (g)</div><div className="text-right font-semibold">{(Number(grams.sugar)||0).toFixed(0)}</div>
              <div className="opacity-70">Sal (g)</div><div className="text-right font-semibold">{(Number(grams.salt)||0).toFixed(0)}</div>
              <div className="opacity-70">Azeite (g)</div><div className="text-right font-semibold">{(Number(grams.oliveOil)||0).toFixed(0)}</div>
              <div className="opacity-70">Óleo (g)</div><div className="text-right font-semibold">{(Number(grams.oil)||0).toFixed(0)}</div>
              <div className="opacity-70">Fermento (g)</div><div className="text-right font-semibold">{(Number(grams.yeast)||0).toFixed(1)}</div>
            </div>
          </div>
        </section>

        <footer className="pb-8 text-center text-xs opacity-70">
          Feito com React + Vite + Tailwind. Interface responsiva e acessível.
        </footer>
      </div>
    </div>
  )
}