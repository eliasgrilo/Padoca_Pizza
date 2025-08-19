import React, { useEffect, useMemo, useState } from 'react'

const yeastSuggestions = {
  IDY: 0.23,
  ADY: 0.15,
  CY: 0.7,
  SSD: 0.1,
  LSD: 0.02,
}

const prefermentSuggestions = {
  Poolish: { flour: 30, water: 100, yeast: 0.3 },
  Biga: { flour: 30, water: 50, yeast: 0.1 },
  Levain: { flour: 20, water: 100, yeast: 0 },
}

function Stepper({ value, onChange, step = 1, min = 1 }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <div className="value">{value}</div>
      <button onClick={() => onChange(value + step)}>+</button>
    </div>
  )
}

function PresetButton({ active, children, onClick }) {
  return (
    <div className={`preset ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </div>
  )
}

function numberOr(v, fallback) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

export default function App() {
  // Core states
  const [doughBalls, setDoughBalls] = useState(1)
  const [ballWeight, setBallWeight] = useState(700)

  const [waterPercent, setWaterPercent] = useState(60)
  const [fatsPercent, setFatsPercent] = useState(0)
  const [saltPercent, setSaltPercent] = useState(2.5)
  const [sugarPercent, setSugarPercent] = useState(0)

  const [rtLeavening, setRtLeavening] = useState(0)
  const [rtTemp, setRtTemp] = useState(25)
  const [ctLeavening, setCtLeavening] = useState(0)
  const [ctTemp, setCtTemp] = useState(4)

  const [yeastType, setYeastType] = useState('IDY')
  const [yeastPercent, setYeastPercent] = useState(yeastSuggestions['IDY'])

  const [prefermentType, setPrefermentType] = useState('None')
  const [prefFlourPercent, setPrefFlourPercent] = useState(20)
  const [prefWaterPercent, setPrefWaterPercent] = useState(100)
  const [prefYeastPercent, setPrefYeastPercent] = useState(0)

  // Load saves on start
  const [recipes, setRecipes] = useState(() => {
    try {
      const raw = localStorage.getItem('savedRecipes')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(recipes))
  }, [recipes])

  // Auto-update yeast percent when changing type
  useEffect(() => {
    setYeastPercent(yeastSuggestions[yeastType])
  }, [yeastType])

  // Auto-fill preferment presets
  const setPreferment = (type) => {
    setPrefermentType(type)
    if (type !== 'None') {
      const s = prefermentSuggestions[type] || { flour: 20, water: 100, yeast: 0 }
      setPrefFlourPercent(s.flour)
      setPrefWaterPercent(s.water)
      setPrefYeastPercent(s.yeast)
    }
  }

  // Calculations (memoized)
  const calc = useMemo(() => {
    const wP = numberOr(waterPercent, 0) / 100
    const fP = numberOr(fatsPercent, 0) / 100
    const sP = numberOr(saltPercent, 0) / 100
    const suP = numberOr(sugarPercent, 0) / 100
    const yP = numberOr(yeastPercent, 0) / 100

    const sumP = wP + fP + sP + suP + yP
    const flour = ballWeight / (1 + sumP)
    const water = flour * wP
    const fats = flour * fP
    const salt = flour * sP
    const sugar = flour * suP
    const yeast = flour * yP
    const totalBall = ballWeight

    const pfFlourP = prefermentType !== 'None' ? numberOr(prefFlourPercent,0)/100 : 0
    const pfWaterP = prefermentType !== 'None' ? numberOr(prefWaterPercent,0)/100 : 0
    const pfYeastP = prefermentType !== 'None' ? numberOr(prefYeastPercent,0)/100 : 0

    const pref_flour = flour * pfFlourP
    const pref_water = pref_flour * (pfWaterP * 100) / 100 // to keep same math as original
    const pref_yeast = pref_flour * pfYeastP

    const final_flour = flour - pref_flour
    const final_water = water - pref_water
    const final_yeast = yeast - pref_yeast
    const final_salt = salt
    const final_fats = fats
    const final_sugar = sugar

    return {
      perBall: {
        flour: Math.round(flour),
        water: Math.round(water),
        salt: Math.round(salt),
        fats: Math.round(fats),
        sugar: Math.round(sugar),
        yeast: +(yeast.toFixed(2)),
        total: Math.round(totalBall),
      },
      totals: {
        flour: Math.round(flour * doughBalls),
        water: Math.round(water * doughBalls),
        salt: Math.round(salt * doughBalls),
        fats: Math.round(fats * doughBalls),
        sugar: Math.round(sugar * doughBalls),
        yeast: +(yeast * doughBalls).toFixed(2),
        dough: Math.round(totalBall * doughBalls),
      },
      preferment: prefermentType !== 'None' ? {
        totals: {
          flour: Math.round(pref_flour * doughBalls),
          water: Math.round(pref_water * doughBalls),
          yeast: +(pref_yeast * doughBalls).toFixed(2),
        },
        final: {
          flour: Math.round(final_flour * doughBalls),
          water: Math.round(final_water * doughBalls),
          salt: Math.round(final_salt * doughBalls),
          fats: Math.round(final_fats * doughBalls),
          sugar: Math.round(final_sugar * doughBalls),
          yeast: +(final_yeast * doughBalls).toFixed(2),
        }
      } : null
    }
  }, [ballWeight, doughBalls, waterPercent, fatsPercent, saltPercent, sugarPercent, yeastPercent, prefermentType, prefFlourPercent, prefWaterPercent, prefYeastPercent])

  // Helpers matching original actions
  const getCurrentData = () => ({
    doughBalls, ballWeight, waterPercent, fatsPercent, saltPercent, sugarPercent,
    rtLeavening, rtTemp, ctLeavening, ctTemp, yeastType, yeastPercent,
    prefermentType, prefFlourPercent, prefWaterPercent, prefYeastPercent
  })

  const setCurrentData = (d) => {
    setDoughBalls(d.doughBalls ?? 1)
    setBallWeight(d.ballWeight ?? 700)
    setWaterPercent(d.waterPercent ?? 60)
    setFatsPercent(d.fatsPercent ?? 0)
    setSaltPercent(d.saltPercent ?? 2.5)
    setSugarPercent(d.sugarPercent ?? 0)
    setRtLeavening(d.rtLeavening ?? 0)
    setRtTemp(d.rtTemp ?? 25)
    setCtLeavening(d.ctLeavening ?? 0)
    setCtTemp(d.ctTemp ?? 4)
    setYeastType(d.yeastType ?? 'IDY')
    setYeastPercent(d.yeastPercent ?? yeastSuggestions['IDY'])
    setPrefermentType(d.prefermentType ?? 'None')
    if ((d.prefermentType ?? 'None') !== 'None') {
      setPrefFlourPercent(d.prefFlourPercent ?? 20)
      setPrefWaterPercent(d.prefWaterPercent ?? 100)
      setPrefYeastPercent(d.prefYeastPercent ?? 0)
    }
  }

  // Recipe actions
  const saveRecipe = () => {
    const name = window.prompt('Nome da receita:')
    if (!name || !name.trim()) return
    setRecipes(prev => [...prev, { name: name.trim(), data: getCurrentData() }])
  }

  const renameRecipe = (i) => {
    const newName = window.prompt('Novo nome para a receita:', recipes[i].name)
    if (!newName || !newName.trim()) return
    setRecipes(prev => {
      const nx = [...prev]
      nx[i] = { ...nx[i], name: newName.trim() }
      return nx
    })
  }

  const deleteRecipe = (i) => {
    if (!window.confirm('Tem certeza que deseja deletar esta receita?')) return
    setRecipes(prev => prev.filter((_, idx) => idx !== i))
  }

  const exportRecipeCsv = () => {
    const name = window.prompt('Nome para exportar:')
    if (!name || !name.trim()) return
    const d = getCurrentData()
    let csv = 'name,doughBalls,ballWeight,waterPercent,fatsPercent,saltPercent,rtLeavening,rtTemp,ctLeavening,ctTemp,yeastType,yeastPercent,sugarPercent,prefermentType,prefFlourPercent,prefWaterPercent,prefYeastPercent\n'
    csv += `${name.trim()},${d.doughBalls},${d.ballWeight},${d.waterPercent},${d.fatsPercent},${d.saltPercent},${d.rtLeavening},${d.rtTemp},${d.ctLeavening},${d.ctTemp},${d.yeastType},${d.yeastPercent},${d.sugarPercent},${d.prefermentType},${d.prefFlourPercent},${d.prefWaterPercent},${d.prefYeastPercent}\n`
    download('recipe.csv', csv)
  }

  const exportAllCsv = () => {
    if (!recipes.length) { window.alert('Nenhuma receita para exportar.'); return }
    let csv = 'name,doughBalls,ballWeight,waterPercent,fatsPercent,saltPercent,rtLeavening,rtTemp,ctLeavening,ctTemp,yeastType,yeastPercent,sugarPercent,prefermentType,prefFlourPercent,prefWaterPercent,prefYeastPercent\n'
    recipes.forEach(r => {
      const d = r.data
      csv += `${r.name},${d.doughBalls},${d.ballWeight},${d.waterPercent},${d.fatsPercent},${d.saltPercent},${d.rtLeavening},${d.rtTemp},${d.ctLeavening},${d.ctTemp},${d.yeastType},${d.yeastPercent},${d.sugarPercent||0},${d.prefermentType||'None'},${d.prefFlourPercent||0},${d.prefWaterPercent||0},${d.prefYeastPercent||0}\n`
    })
    download('all_recipes.csv', csv)
  }

  const download = (filename, text) => {
    const a = document.createElement('a')
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    a.setAttribute('download', filename)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const fracionarMassa = () => {
    let total = window.prompt('Informe o peso total da massa (g):')
    const n = parseFloat(total)
    if (!Number.isFinite(n) || n <= 0) { window.alert('Valor inválido!'); return }
    const num = Math.floor(n / ballWeight)
    const rem = n % ballWeight
    window.alert(`Você pode fracionar em ${num} bolas de ${ballWeight}g cada, com sobra de ${rem.toFixed(1)}g.`)
  }

  const calculoReverso = () => {
    let totalFlour = window.prompt('Informe a quantidade total de farinha (g):')
    const n = parseFloat(totalFlour)
    if (!Number.isFinite(n) || n <= 0) { window.alert('Valor inválido!'); return }
    const sumP = waterPercent/100 + fatsPercent/100 + saltPercent/100 + sugarPercent/100 + yeastPercent/100
    const flourPerBall = n / doughBalls
    const newBallWeight = flourPerBall * (1 + sumP)
    setBallWeight(Math.round(newBallWeight))
  }

  const suggestYeast = () => {
    const rtH = numberOr(rtLeavening,0)
    const ctH = numberOr(ctLeavening,0)
    const totalTime = (rtH + ctH) || 24
    const rtT = numberOr(rtTemp,25)
    const ctT = numberOr(ctTemp,4)
    const avgTemp = (rtH * rtT + ctH * ctT) / totalTime || 20
    let baseYeast = 0.6 / totalTime
    baseYeast *= Math.pow(1.035, 20 - avgTemp)
    baseYeast = Math.max(0.02, Math.min(1, baseYeast))
    setYeastPercent(+baseYeast.toFixed(2))
    window.alert(`Sugestão de % de fermento baseada em tempo e temperatura: ${baseYeast.toFixed(2)}%`)
  }

  const generateInstructions = () => {
    const d = getCurrentData()
    const flour = calc.totals.flour
    const water = calc.totals.water
    const salt = calc.totals.salt
    const fats = calc.totals.fats
    const sugar = calc.totals.sugar
    const yeast = calc.totals.yeast
    let steps = 'Receita de Massa de Pizza\\n\\n'
    if (prefermentType !== 'None' && calc.preferment) {
      const pf = calc.preferment.totals
      steps += `1. Prepare o preferment (${prefermentType}): Misture ${pf.flour}g farinha, ${pf.water}g água, ${(+pf.yeast).toFixed(2)}g fermento. Deixe fermentar por 4-12 horas dependendo do tipo.\\n`
      const final = calc.preferment.final
      steps += `2. Massa final: Misture ${final.flour}g farinha, ${final.water}g água, ${final.salt}g sal, ${final.fats}g gordura, ${final.sugar}g açúcar, ${(+final.yeast).toFixed(2)}g fermento, e o prefermento.\\n`
    } else {
      steps += `1. Misture todos os ingredientes: ${flour}g farinha, ${water}g água, ${salt}g sal, ${fats}g gordura, ${sugar}g açúcar, ${(+yeast).toFixed(2)}g fermento.\\n`
    }
    steps += '3. Amasse até formar uma massa homogênea e elástica (10-15 minutos).\\n'
    steps += `4. Deixe levedar ${d.rtLeavening}h a ${d.rtTemp}°C, depois ${d.ctLeavening}h a ${d.ctTemp}°C.\\n`
    steps += `5. Divida em ${d.doughBalls} bolas de aproximadamente ${d.ballWeight}g cada.\\n`
    steps += '6. Deixe descansar por 30-60 minutos antes de abrir e assar.\\n'
    steps += 'Dica: Asse em forno quente (250-300°C) por 8-12 minutos.'
    window.alert(steps)
  }

  const nutritionEstimate = () => {
    const flour = calc.perBall.flour
    const fats = calc.perBall.fats
    const sugar = calc.perBall.sugar
    const yeast = calc.perBall.yeast
    const calPerBall = Math.round(flour * 3.5 + fats * 9 + sugar * 4 + yeast * 3)
    const total = calPerBall * doughBalls
    window.alert(`Estimativa nutricional aproximada:\\nPor bola: ${calPerBall} kcal\\nTotal: ${total} kcal\\n( Baseado em farinha 350kcal/100g, gordura 900kcal/100g, açúcar 400kcal/100g, fermento 300kcal/100g. Valores aproximados.)`)
  }

  return (
    <div className="app">
      <header>
        <h1>PizzApp — Calculadora de Massa</h1>
      </header>

      <div className="grid">
        {/* Left card: Controls */}
        <div className="card">
          <div className="label">Dough Balls</div>
          <Stepper value={doughBalls} onChange={setDoughBalls} />

          <div className="label">Ball Weight (g)</div>
          <Stepper value={ballWeight} onChange={setBallWeight} step={50} />

          <div className="label">Water (%)</div>
          <input type="number" value={waterPercent} onChange={e=>setWaterPercent(numberOr(e.target.value,0))} step="1" min="0" />

          <div className="percent">
            <div className="label">Fats (%)</div>
            <input type="number" className="small-input" value={fatsPercent} onChange={e=>setFatsPercent(numberOr(e.target.value,0))} step="0.1" min="0" />
            <div className="label">Salt (%)</div>
            <input type="number" className="small-input" value={saltPercent} onChange={e=>setSaltPercent(numberOr(e.target.value,0))} step="0.1" min="0" />
          </div>

          <div className="percent">
            <div className="label">Sugar (%)</div>
            <input type="number" className="small-input" value={sugarPercent} onChange={e=>setSugarPercent(numberOr(e.target.value,0))} step="0.1" min="0" />
          </div>

          <div className="percent">
            <div className="label">RT leavening (h)</div>
            <input type="number" className="small-input" value={rtLeavening} onChange={e=>setRtLeavening(numberOr(e.target.value,0))} step="1" min="0" />
            <div className="label">RT °C</div>
            <input type="number" className="small-input" value={rtTemp} onChange={e=>setRtTemp(numberOr(e.target.value,0))} step="1" min="0" />
          </div>

          <div className="percent">
            <div className="label">CT leavening (h)</div>
            <input type="number" className="small-input" value={ctLeavening} onChange={e=>setCtLeavening(numberOr(e.target.value,0))} step="1" min="0" />
            <div className="label">CT °C</div>
            <input type="number" className="small-input" value={ctTemp} onChange={e=>setCtTemp(numberOr(e.target.value,0))} step="1" min="0" />
          </div>

          <div className="label">Yeast Type</div>
          <div className="yeast-presets">
            {Object.keys(yeastSuggestions).map(k => (
              <PresetButton key={k} active={yeastType===k} onClick={()=>setYeastType(k)}>{k}</PresetButton>
            ))}
          </div>

          <div className="label">Yeast (%)</div>
          <input type="number" value={yeastPercent} onChange={e=>setYeastPercent(numberOr(e.target.value,0))} step="0.01" min="0" />
          <div className="small">Percentual sobre a farinha (editar)</div>

          <div className="label">Tipo de Fermentação</div>
          <div className="yeast-presets preferment-presets">
            {['None','Poolish','Biga','Levain'].map(t => (
              <PresetButton key={t} active={prefermentType===t} onClick={()=>setPreferment(t)}>
                {t==='None'?'Nenhum':t}
              </PresetButton>
            ))}
          </div>

          {prefermentType !== 'None' && (
            <div id="prefermentOptions">
              <div className="label">Farinha Preferment (% total farinha)</div>
              <input type="number" value={prefFlourPercent} onChange={e=>setPrefFlourPercent(numberOr(e.target.value,0))} step="1" min="0" max="100" />
              <div className="label">Água Preferment (% pref farinha)</div>
              <input type="number" value={prefWaterPercent} onChange={e=>setPrefWaterPercent(numberOr(e.target.value,0))} step="1" min="0" />
              <div className="label">Fermento Preferment (% pref farinha)</div>
              <input type="number" value={prefYeastPercent} onChange={e=>setPrefYeastPercent(numberOr(e.target.value,0))} step="0.01" min="0" />
            </div>
          )}

          <div className="label">Salvar / Carregar receitas</div>
          <div className="actions">
            <button className="btn" onClick={saveRecipe}>Salvar receita</button>
            <label className="btn" htmlFor="importFile">Importar CSV</label>
            <input type="file" id="importFile" accept=".csv" style={{display:'none'}} onChange={(e)=>{
              const file = e.target.files?.[0]; if(!file) return;
              const reader = new FileReader();
              reader.onload = (ev)=>{
                const csv = String(ev.target.result);
                const lines = csv.split(/\r?\n/);
                // expect header line 0
                for(let i=1;i<lines.length;i++){
                  if(lines[i].trim()==='') continue;
                  const vals = lines[i].split(',');
                  const data = {
                    doughBalls: parseInt(vals[1]),
                    ballWeight: parseFloat(vals[2]),
                    waterPercent: parseFloat(vals[3]),
                    fatsPercent: parseFloat(vals[4]),
                    saltPercent: parseFloat(vals[5]),
                    rtLeavening: parseFloat(vals[6]),
                    rtTemp: parseFloat(vals[7]),
                    ctLeavening: parseFloat(vals[8]),
                    ctTemp: parseFloat(vals[9]),
                    yeastType: vals[10],
                    yeastPercent: parseFloat(vals[11]),
                    sugarPercent: parseFloat(vals[12] || 0),
                    prefermentType: vals[13] || 'None',
                    prefFlourPercent: parseFloat(vals[14] || 0),
                    prefWaterPercent: parseFloat(vals[15] || 0),
                    prefYeastPercent: parseFloat(vals[16] || 0),
                  }
                  setRecipes(prev => [...prev, { name: vals[0], data }])
                }
              };
              reader.readAsText(file);
            }} />
            <button className="btn" onClick={exportRecipeCsv}>Exportar receita (CSV)</button>
            <button className="btn" onClick={exportAllCsv}>Exportar todas (CSV)</button>
            <button className="btn" onClick={()=>window.print()}>Imprimir</button>
            <button className="btn" onClick={()=>{ window.alert('Use a função Imprimir e salve como PDF no navegador.'); window.print(); }}>Exportar PDF</button>
          </div>

          <div className="label">Receitas salvas</div>
          <div id="recipeList" className="recipe-list">
            {recipes.length===0 ? 'Nenhuma receita salva.' : recipes.map((r,i)=>(
              <div className="row-between" key={i}>
                <span>{r.name}</span>
                <div>
                  <button onClick={()=>setCurrentData(r.data)}>Carregar</button>
                  <button onClick={()=>renameRecipe(i)}>Renomear</button>
                  <button onClick={()=>deleteRecipe(i)}>Deletar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="label">Ferramentas</div>
          <div className="actions">
            <button className="btn secondary" onClick={fracionarMassa}>Fracionar massa</button>
            <button className="btn secondary" onClick={calculoReverso}>Cálculo reverso (a partir da farinha)</button>
            <button className="btn secondary" onClick={suggestYeast}>Sugerir % Fermento</button>
            <button className="btn secondary" onClick={generateInstructions}>Gerar Instruções</button>
            <button className="btn secondary" onClick={nutritionEstimate}>Estimativa Nutricional</button>
          </div>
        </div>

        {/* Right card: Results */}
        <div className="card print-area">
          <div className="label">Resultados por bola <span className="small">Arredondados (g)</span></div>
          <p className="small">Valores atualizam ao vivo</p>
          <div className="results">
            <div className="pill">Farinha: <span id="flourPerBall">{calc.perBall.flour}</span> g</div>
            <div className="pill">Água: <span id="waterPerBall">{calc.perBall.water}</span> g</div>
            <div className="pill">Sal: <span id="saltPerBall">{calc.perBall.salt}</span> g</div>
            <div className="pill">Gordura: <span id="fatsPerBall">{calc.perBall.fats}</span> g</div>
            <div className="pill">Açúcar: <span id="sugarPerBall">{calc.perBall.sugar}</span> g</div>
            <div className="pill">Fermento: <span id="yeastPerBall">{calc.perBall.yeast}</span> g</div>
            <div className="pill">Total bola: <span id="totalPerBall">{calc.perBall.total}</span> g</div>
          </div>

          <div className="label">Resultados totais</div>
          <div className="results">
            <div className="pill">Farinha total: <span id="flourTotal">{calc.totals.flour}</span> g</div>
            <div className="pill">Água total: <span id="waterTotal">{calc.totals.water}</span> g</div>
            <div className="pill">Sal total: <span id="saltTotal">{calc.totals.salt}</span> g</div>
            <div className="pill">Gordura total: <span id="fatsTotal">{calc.totals.fats}</span> g</div>
            <div className="pill">Açúcar total: <span id="sugarTotal">{calc.totals.sugar}</span> g</div>
            <div className="pill">Fermento total: <span id="yeastTotal">{calc.totals.yeast}</span> g</div>
            <div className="pill">Massa total: <span id="totalDough">{calc.totals.dough}</span> g</div>
          </div>

          {calc.preferment && (
            <>
              <div id="prefermentResults">
                <div className="label">Preferment (totais)</div>
                <div className="results">
                  <div className="pill">Farinha: <span id="prefFlourTotal">{calc.preferment.totals.flour}</span> g</div>
                  <div className="pill">Água: <span id="prefWaterTotal">{calc.preferment.totals.water}</span> g</div>
                  <div className="pill">Fermento: <span id="prefYeastTotal">{calc.preferment.totals.yeast}</span> g</div>
                </div>
                <div className="label">Massa Final (totais)</div>
                <div className="results">
                  <div className="pill">Farinha: <span id="finalFlourTotal">{calc.preferment.final.flour}</span> g</div>
                  <div className="pill">Água: <span id="finalWaterTotal">{calc.preferment.final.water}</span> g</div>
                  <div className="pill">Sal: <span id="finalSaltTotal">{calc.preferment.final.salt}</span> g</div>
                  <div className="pill">Gordura: <span id="finalFatsTotal">{calc.preferment.final.fats}</span> g</div>
                  <div className="pill">Açúcar: <span id="finalSugarTotal">{calc.preferment.final.sugar}</span> g</div>
                  <div className="pill">Fermento: <span id="finalYeastTotal">{calc.preferment.final.yeast}</span> g</div>
                </div>
              </div>
              <div className="footer-note">Cálculo: Farinha = Peso da bola / (1 + soma dos percentuais). Ingredientes = Farinha × percentual.</div>
              <div className="footer-note">Sugestões: IDY ≈ 0.23%, ADY ≈ 0.15%, CY ≈ 0.7%, SSD ≈ 0.1%, LSD ≈ 0.02%.</div>
            </>
          )}
          {!calc.preferment && (
            <>
              <div className="footer-note">Cálculo: Farinha = Peso da bola / (1 + soma dos percentuais). Ingredientes = Farinha × percentual.</div>
              <div className="footer-note">Sugestões: IDY ≈ 0.23%, ADY ≈ 0.15%, CY ≈ 0.7%, SSD ≈ 0.1%, LSD ≈ 0.02%.</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
