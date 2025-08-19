import React, { useState, useMemo } from 'react'
import Stepper from './components/Stepper'
import Results from './components/Results'
import YeastPresets from './components/YeastPresets'
import RecipeManager from './components/RecipeManager'

const defaultState = {
  balls: 1,
  ballWeight: 700,
  waterPct: 80,
  fatsPct: 4.6,
  saltPct: 2.5,
  yeastPct: 0.23,
  rtH: 5, rtT: 20, ctH: 43, ctT: 4,
  name: ''
}

export default function App(){
  const [state, setState] = useState(defaultState)
  const setField = (k,v) => setState(s => ({...s, [k]: typeof v === 'string' && v.match(/^\d+(\.\d+)?$/) ? Number(v) : v }))

  const results = useMemo(()=>{
    const s = state
    const sanitize = v => (isFinite(v) ? parseFloat(v) : 0)
    const water = sanitize(s.waterPct)/100
    const fats = sanitize(s.fatsPct)/100
    const salt = sanitize(s.saltPct)/100
    const yeast = sanitize(s.yeastPct)/100
    const sum = water + fats + salt + yeast
    const flourPerBall = s.ballWeight / (1 + sum)
    const waterPerBall = flourPerBall * water
    const fatPerBall = flourPerBall * fats
    const saltPerBall = flourPerBall * salt
    const yeastPerBall = flourPerBall * yeast
    const totalPerBall = flourPerBall + waterPerBall + fatPerBall + saltPerBall + yeastPerBall
    const balls = s.balls
    return {
      flourPerBall, waterPerBall, fatPerBall, saltPerBall, yeastPerBall, totalPerBall,
      flourTotal: flourPerBall*balls, waterTotal: waterPerBall*balls, fatTotal: fatPerBall*balls,
      saltTotal: saltPerBall*balls, yeastTotal: yeastPerBall*balls, doughTotal: totalPerBall*balls,
      sumPercent: (s.waterPct||0) + (s.fatsPct||0) + (s.saltPct||0) + (s.yeastPct||0)
    }
  }, [state])

  return (
    <div className="app">
      <header><h1>PizzApp React — Avançado</h1></header>
      <main className="layout">
        <section className="card">
          <div className="row">
            <div>
              <label className="label">Bolas</label>
              <Stepper value={state.balls} onChange={v=>setField('balls',v)} min={1} step={1}/>
            </div>
            <div>
              <label className="label">Peso por bola (g)</label>
              <Stepper value={state.ballWeight} onChange={v=>setField('ballWeight',v)} min={10} step={10}/>
            </div>
          </div>

          <div className="inputs">
            <label className="label">Água (%)</label>
            <input type="number" value={state.waterPct} onChange={e=>setField('waterPct', e.target.value)} />
            <div className="row">
              <div>
                <label className="label">Gorduras (%)</label>
                <input type="number" value={state.fatsPct} onChange={e=>setField('fatsPct', e.target.value)} />
              </div>
              <div>
                <label className="label">Sal (%)</label>
                <input type="number" value={state.saltPct} onChange={e=>setField('saltPct', e.target.value)} />
              </div>
            </div>

            <label className="label">Fermento (%)</label>
            <div className="row">
              <input type="number" value={state.yeastPct} onChange={e=>setField('yeastPct', e.target.value)} step="0.01" />
              <YeastPresets onSelect={(val)=>setField('yeastPct', val)} />
            </div>

            <div className="validation small" style={{color: results.sumPercent > 200 ? '#c33' : (results.sumPercent > 150 ? '#c60' : '#666')}}>
              Soma dos percentuais: {Math.round(results.sumPercent*10)/10}%. {results.sumPercent > 200 ? 'Inválido para salvar (excede 200%).' : ''}
            </div>

            <div className="row">
              <div>
                <label className="label">RT h</label>
                <input type="number" value={state.rtH} onChange={e=>setField('rtH', e.target.value)} />
              </div>
              <div>
                <label className="label">CT h</label>
                <input type="number" value={state.ctH} onChange={e=>setField('ctH', e.target.value)} />
              </div>
            </div>

            <div className="actions" style={{marginTop:8}}>
              <RecipeManager state={state} setState={setState} results={results} />
            </div>
          </div>
        </section>

        <section className="card">
          <Results state={state} results={results} />
        </section>
      </main>
    </div>
  )
}
