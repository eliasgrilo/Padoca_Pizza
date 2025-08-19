import React, { useEffect, useMemo, useState, useRef } from "react";

const YEAST_SUGGESTIONS = { IDY: 0.23, ADY: 0.15, CY: 0.7, SSD: 0.1, LSD: 0.02 };
const PREF_SUGGESTIONS = {
  Poolish: { flour: 30, water: 100, yeast: 0.3 },
  Biga:    { flour: 30, water: 50,  yeast: 0.1 },
  Levain:  { flour: 20, water: 100, yeast: 0   },
};
const safe = (n, d=0) => Number.isFinite(+n) ? +n : d;

export default function App() {
  // Inputs
  const [doughBalls, setDoughBalls] = useState(1);
  const [ballWeight, setBallWeight] = useState(250);
  const [waterP, setWaterP] = useState(60);
  const [oilP, setOilP] = useState(0);
  const [oliveOilP, setOliveOilP] = useState(0);
  const [saltP, setSaltP] = useState(2.5);
  const [sugarP, setSugarP] = useState(0);
  const [rtH, setRtH] = useState(0);
  const [rtT, setRtT] = useState(25);
  const [ctH, setCtH] = useState(0);
  const [ctT, setCtT] = useState(4);
  const [yeastType, setYeastType] = useState("IDY");
  const [yeastP, setYeastP] = useState(YEAST_SUGGESTIONS["IDY"]);
  const [prefType, setPrefType] = useState("None");
  const [prefFlourP, setPrefFlourP] = useState(0);
  const [prefWaterP, setPrefWaterP] = useState(0);
  const [prefYeastP, setPrefYeastP] = useState(0);

  // Recipes management
  const [recipes, setRecipes] = useState([]);
  const inputFileRef = useRef(null);

  // Load state and recipes from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("padoca_pizza_state") || "null");
      if (saved) {
        setDoughBalls(safe(saved.doughBalls, 1));
        setBallWeight(safe(saved.ballWeight, 250));
        setWaterP(safe(saved.waterP, 60));
        setOilP(safe(saved.oilP, 0));
        setOliveOilP(safe(saved.oliveOilP, 0));
        setSaltP(safe(saved.saltP, 2.5));
        setSugarP(safe(saved.sugarP, 0));
        setRtH(safe(saved.rtH, 0)); setRtT(safe(saved.rtT, 25));
        setCtH(safe(saved.ctH, 0)); setCtT(safe(saved.ctT, 4));
        setYeastType(saved.yeastType || "IDY");
        setYeastP(safe(saved.yeastP, YEAST_SUGGESTIONS["IDY"]));
        setPrefType(saved.prefType || "None");
        setPrefFlourP(safe(saved.prefFlourP, 0));
        setPrefWaterP(safe(saved.prefWaterP, 0));
        setPrefYeastP(safe(saved.prefYeastP, 0));
      }
      const savedRecipes = JSON.parse(localStorage.getItem("padoca_pizza_recipes") || "null");
      if (Array.isArray(savedRecipes)) setRecipes(savedRecipes);
    } catch (e) {
      console.error("Load error", e);
    }
  }, []);

  // Save app state to localStorage
  useEffect(() => {
    const data = {
      doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP,
      rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP
    };
    localStorage.setItem("padoca_pizza_state", JSON.stringify(data));
  }, [doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP, rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP]);

  // Save recipes when changed
  useEffect(() => {
    localStorage.setItem("padoca_pizza_recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => { setYeastP(YEAST_SUGGESTIONS[yeastType] ?? 0); }, [yeastType]);
  useEffect(() => {
    if (prefType === "None") { setPrefFlourP(0); setPrefWaterP(0); setPrefYeastP(0); return; }
    const s = PREF_SUGGESTIONS[prefType] || { flour:0, water:0, yeast:0 };
    setPrefFlourP(s.flour); setPrefWaterP(s.water); setPrefYeastP(s.yeast);
  }, [prefType]);

  const calc = useMemo(() => {
    const sumFat = safe(oilP) + safe(oliveOilP);
    const sumPerc = safe(waterP) + sumFat + safe(saltP) + safe(sugarP) + safe(yeastP);
    const flourBall = safe(ballWeight) / (1 + sumPerc/100);
    const waterBall = flourBall * safe(waterP)/100;
    const oilBall = flourBall * safe(oilP)/100;
    const oliveBall = flourBall * safe(oliveOilP)/100;
    const saltBall = flourBall * safe(saltP)/100;
    const sugarBall = flourBall * safe(sugarP)/100;
    const yeastBall = flourBall * safe(yeastP)/100;

    const prefFlour = prefType==='None' ? 0 : flourBall * safe(prefFlourP)/100;
    const prefWater = prefType==='None' ? 0 : prefFlour * safe(prefWaterP)/100;
    const prefYeast = prefType==='None' ? 0 : prefFlour * safe(prefYeastP)/100;

    const finalFlour = flourBall - prefFlour;
    const finalWater = waterBall - prefWater;
    const finalSalt = saltBall;
    const finalOil = oilBall;
    const finalOlive = oliveBall;
    const finalSugar = sugarBall;
    const finalYeast = yeastBall - prefYeast;

    const byBall = {
      flour: Math.round(flourBall),
      water: Math.round(waterBall),
      salt: Math.round(saltBall),
      oil: Math.round(oilBall),
      olive: Math.round(oliveBall),
      sugar: Math.round(sugarBall),
      yeast: +(yeastBall.toFixed(2)),
      total: Math.round(ballWeight)
    };
    const totals = {
      flour: Math.round(flourBall * safe(doughBalls,1)),
      water: Math.round(waterBall * safe(doughBalls,1)),
      salt: Math.round(saltBall * safe(doughBalls,1)),
      oil: Math.round(oilBall * safe(doughBalls,1)),
      olive: Math.round(oliveBall * safe(doughBalls,1)),
      sugar: Math.round(sugarBall * safe(doughBalls,1)),
      yeast: +(yeastBall * safe(doughBalls,1)).toFixed(2),
      total: Math.round(safe(ballWeight) * safe(doughBalls,1))
    };
    const prefTotals = {
      flour: Math.round(prefFlour * safe(doughBalls,1)),
      water: Math.round(prefWater * safe(doughBalls,1)),
      yeast: +(prefYeast * safe(doughBalls,1)).toFixed(2)
    };
    const finalTotals = {
      flour: Math.round(finalFlour * safe(doughBalls,1)),
      water: Math.round(finalWater * safe(doughBalls,1)),
      salt: Math.round(finalSalt * safe(doughBalls,1)),
      oil: Math.round(finalOil * safe(doughBalls,1)),
      olive: Math.round(finalOlive * safe(doughBalls,1)),
      sugar: Math.round(finalSugar * safe(doughBalls,1)),
      yeast: +(finalYeast * safe(doughBalls,1)).toFixed(2)
    };
    return { byBall, totals, prefTotals, finalTotals };
  }, [ballWeight, doughBalls, waterP, oilP, oliveOilP, saltP, sugarP, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP]);

  // Recipe actions
  const saveRecipe = () => {
    const name = window.prompt("Nome da receita:");
    if (!name || !name.trim()) return;
    const data = {
      name: name.trim(),
      data: {
        doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP,
        rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP
      }
    };
    setRecipes(prev => [...prev, data]);
  };

  const loadRecipe = (i) => {
    const r = recipes[i];
    if (!r) return;
    const d = r.data;
    setDoughBalls(safe(d.doughBalls,1));
    setBallWeight(safe(d.ballWeight,250));
    setWaterP(safe(d.waterP,60));
    setOilP(safe(d.oilP,0));
    setOliveOilP(safe(d.oliveOilP,0));
    setSaltP(safe(d.saltP,2.5));
    setSugarP(safe(d.sugarP,0));
    setRtH(safe(d.rtH,0)); setRtT(safe(d.rtT,25));
    setCtH(safe(d.ctH,0)); setCtT(safe(d.ctT,4));
    setYeastType(d.yeastType || "IDY");
    setYeastP(safe(d.yeastP, YEAST_SUGGESTIONS["IDY"]));
    setPrefType(d.prefType || "None");
    setPrefFlourP(safe(d.prefFlourP,0));
    setPrefWaterP(safe(d.prefWaterP,0));
    setPrefYeastP(safe(d.prefYeastP,0));
    window.alert(`Receita "${r.name}" carregada.`);
  };

  const renameRecipe = (i) => {
    const nr = window.prompt("Novo nome:", recipes[i]?.name || "");
    if (!nr || !nr.trim()) return;
    setRecipes(prev => prev.map((r,idx)=> idx===i ? {...r, name: nr.trim()} : r));
  };

  const deleteRecipe = (i) => {
    if (!window.confirm("Deletar receita?")) return;
    setRecipes(prev => prev.filter((_,idx)=> idx!==i));
  };

  // CSV export single recipe
  const exportRecipeCsv = (i) => {
    const r = recipes[i];
    if (!r) { window.alert("Selecione uma receita válida."); return; }
    const d = r.data;
    const header = ["name","doughBalls","ballWeight","waterP","oilP","oliveOilP","saltP","sugarP","rtH","rtT","ctH","ctT","yeastType","yeastP","prefType","prefFlourP","prefWaterP","prefYeastP"];
    const row = [r.name, d.doughBalls, d.ballWeight, d.waterP, d.oilP, d.oliveOilP, d.saltP, d.sugarP, d.rtH, d.rtT, d.ctH, d.ctT, d.yeastType, d.yeastP, d.prefType, d.prefFlourP, d.prefWaterP, d.prefYeastP];
    const csv = header.join(",") + "\n" + row.join(",");
    downloadFile(csv, `${r.name.replace(/\s+/g,"_")}.csv`);
  };

  const exportAllCsv = () => {
    if (!recipes.length) { window.alert("Nenhuma receita salva."); return; }
    const header = ["name","doughBalls","ballWeight","waterP","oilP","oliveOilP","saltP","sugarP","rtH","rtT","ctH","ctT","yeastType","yeastP","prefType","prefFlourP","prefWaterP","prefYeastP"];
    const lines = recipes.map(r => {
      const d = r.data;
      return [r.name, d.doughBalls, d.ballWeight, d.waterP, d.oilP, d.oliveOilP, d.saltP, d.sugarP, d.rtH, d.rtT, d.ctH, d.ctT, d.yeastType, d.yeastP, d.prefType, d.prefFlourP, d.prefWaterP, d.prefYeastP].join(",");
    });
    const csv = header.join(",") + "\n" + lines.join("\n");
    downloadFile(csv, `padoca_recipes_export.csv`);
  };

  const downloadFile = (text, filename) => {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Import CSV (simple parser expecting header as above)
  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target.result || "");
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      if (!lines.length) return;
      const header = lines[0].split(",");
      const rows = lines.slice(1);
      const imported = rows.map(row => {
        const vals = row.split(",");
        const obj = {};
        header.forEach((h, idx) => { obj[h]= vals[idx]; });
        // normalize
        const data = {
          doughBalls: safe(parseFloat(obj.doughBalls)||0,1),
          ballWeight: safe(parseFloat(obj.ballWeight)||0,250),
          waterP: safe(parseFloat(obj.waterP)||0,0),
          oilP: safe(parseFloat(obj.oilP)||0,0),
          oliveOilP: safe(parseFloat(obj.oliveOilP)||0,0),
          saltP: safe(parseFloat(obj.saltP)||0,0),
          sugarP: safe(parseFloat(obj.sugarP)||0,0),
          rtH: safe(parseFloat(obj.rtH)||0,0),
          rtT: safe(parseFloat(obj.rtT)||0,0),
          ctH: safe(parseFloat(obj.ctH)||0,0),
          ctT: safe(parseFloat(obj.ctT)||0,0),
          yeastType: obj.yeastType || 'IDY',
          yeastP: safe(parseFloat(obj.yeastP)||0,0),
          prefType: obj.prefType || 'None',
          prefFlourP: safe(parseFloat(obj.prefFlourP)||0,0),
          prefWaterP: safe(parseFloat(obj.prefWaterP)||0,0),
          prefYeastP: safe(parseFloat(obj.prefYeastP)||0,0)
        };
        return { name: obj.name || 'Imported', data };
      });
      setRecipes(prev => [...prev, ...imported]);
      window.alert(`Importadas ${imported.length} receitas.`);
    };
    reader.readAsText(file);
  };

  // Tools
  const fracionarMassa = () => {
    const total = window.prompt("Informe o peso total da massa (g):");
    const n = parseFloat(total);
    if (!Number.isFinite(n) || n<=0) { window.alert("Valor inválido"); return; }
    const num = Math.floor(n / ballWeight);
    const rem = n % ballWeight;
    window.alert(`Pode fracionar em ${num} bolas de ${ballWeight}g, sobra ${rem.toFixed(1)}g`);
  };

  const calculoReverso = () => {
    const totalFlour = window.prompt("Informe a quantidade total de farinha (g):");
    const n = parseFloat(totalFlour);
    if (!Number.isFinite(n) || n<=0) { window.alert("Valor inválido"); return; }
    const sumP = (safe(waterP)+safe(oilP)+safe(oliveOilP)+safe(saltP)+safe(sugarP)+safe(yeastP))/100;
    const flourPerBall = n / doughBalls;
    const newBall = Math.round(flourPerBall * (1 + sumP));
    setBallWeight(newBall);
    window.alert(`Novo peso por bola calculado: ${newBall} g`);
  };

  const suggestYeast = () => {
    const totalTime = (safe(rtH)+safe(ctH)) || 24;
    const avgTemp = ((safe(rtH)*safe(rtT)) + (safe(ctH)*safe(ctT))) / (safe(rtH)+safe(ctH) || 1);
    let base = 0.6 / totalTime;
    base *= Math.pow(1.035, 20 - avgTemp);
    base = Math.max(0.02, Math.min(1, base));
    setYeastP(+base.toFixed(2));
    window.alert(`Sugestão de fermento: ${base.toFixed(2)}%`);
  };

  const generateInstructions = () => {
    const d = { doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP, yeastP, prefType };
    let steps = `Receita — ${doughBalls} bolas de ${ballWeight}g\n\n`;
    if (prefType!=='None') {
      steps += `1) Prepare prefermento (${prefType}) com ${calc.prefTotals.flour}g farinha, ${calc.prefTotals.water}g água, ${calc.prefTotals.yeast}g fermento.\n`;
      steps += `2) Misture a massa final com ${calc.finalTotals.flour}g farinha, ${calc.finalTotals.water}g água e demais ingredientes.\n`;
    } else {
      steps += `1) Misture todos os ingredientes: ${calc.totals.flour}g farinha, ${calc.totals.water}g água, ${calc.totals.yeast}g fermento, etc.\n`;
    }
    steps += `3) Modelar, descansar e assar. Tempo RT: ${rtH}h a ${rtT}°C, CT: ${ctH}h a ${ctT}°C.\n`;
    window.alert(steps);
  };

  const nutritionEstimate = () => {
    const calFlour = 3.5; // per g
    const calFat = 9; // per g
    const calSugar = 4;
    const flour = calc.byBall.flour;
    const fat = calc.byBall.oil + calc.byBall.olive;
    const sugar = calc.byBall.sugar;
    const yeast = calc.byBall.yeast;
    const kcal = Math.round(flour*calFlour + fat*calFat + sugar*calSugar + yeast*3);
    window.alert(`Estimativa por bola: ${kcal} kcal`);
  };

  // Helpers UI
  const handleFileInput = (e) => { const f = e.target.files?.[0]; if(f) handleImport(f); e.target.value = ''; }
  const importClick = () => { inputFileRef.current?.click(); }

  return (
    <div className="app">
      <header><h1>Padoca Pizza — Calculadora</h1></header>
      <div className="grid">
        <div className="card form">
          {/* Inputs */}
          <div className="row"><div className="label">Dough Balls</div>
            <div className="stepper">
              <button className="btn" onClick={()=>setDoughBalls(v=>Math.max(1,v-1))}>−</button>
              <div className="value">{doughBalls}</div>
              <button className="btn" onClick={()=>setDoughBalls(v=>v+1)}>+</button>
            </div>
          </div>

          <div className="row"><div className="label">Ball Weight (g)</div>
            <div className="stepper">
              <button className="btn" onClick={()=>setBallWeight(v=>Math.max(20,v-10))}>−</button>
              <div className="value">{ballWeight}</div>
              <button className="btn" onClick={()=>setBallWeight(v=>v+10)}>+</button>
            </div>
          </div>

          <div className="row"><div className="label">Tipo de fermentação</div>
            <div className="preset-group">
              {['None','Poolish','Biga','Levain'].map(t=>(
                <button key={t} className={`preset ${t===prefType ? 'active':''}`} onClick={()=>setPrefType(t)}>{t}</button>
              ))}
            </div>
          </div>

          {prefType!=='None' && (
            <>
              <div className="row"><div className="label">Farinha Pref (% total farinha)</div>
                <input className="number" type="number" value={prefFlourP} onChange={e=>setPrefFlourP(safe(e.target.value,0))} />
              </div>
              <div className="row"><div className="label">Água Pref (% pref farinha)</div>
                <input className="number" type="number" value={prefWaterP} onChange={e=>setPrefWaterP(safe(e.target.value,0))} />
              </div>
              <div className="row"><div className="label">Fermento Pref (% pref farinha)</div>
                <input className="number" type="number" step="0.01" value={prefYeastP} onChange={e=>setPrefYeastP(safe(e.target.value,0))} />
              </div>
            </>
          )}

          <div className="row"><div className="label">Water (%)</div>
            <input className="number" type="number" value={waterP} onChange={e=>setWaterP(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">Oil (%)</div>
            <input className="number" type="number" value={oilP} onChange={e=>setOilP(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">Olive Oil (%)</div>
            <input className="number" type="number" value={oliveOilP} onChange={e=>setOliveOilP(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">Salt (%)</div>
            <input className="number" type="number" value={saltP} onChange={e=>setSaltP(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">Sugar (%)</div>
            <input className="number" type="number" value={sugarP} onChange={e=>setSugarP(safe(e.target.value,0))} />
          </div>

          <div className="row"><div className="label">RT leavening (h)</div>
            <input className="number" type="number" value={rtH} onChange={e=>setRtH(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">RT °C</div>
            <input className="number" type="number" value={rtT} onChange={e=>setRtT(safe(e.target.value,25))} />
          </div>
          <div className="row"><div className="label">CT leavening (h)</div>
            <input className="number" type="number" value={ctH} onChange={e=>setCtH(safe(e.target.value,0))} />
          </div>
          <div className="row"><div className="label">CT °C</div>
            <input className="number" type="number" value={ctT} onChange={e=>setCtT(safe(e.target.value,4))} />
          </div>

          <div className="row"><div className="label">Yeast Type</div>
            <div className="preset-group">{Object.keys(YEAST_SUGGESTIONS).map(t=>(
              <button key={t} className={`preset ${t===yeastType?'active':''}`} onClick={()=>setYeastType(t)}>{t}</button>
            ))}</div>
          </div>
          <div className="row"><div className="label">Yeast (%) <span className="small-note">(editável)</span></div>
            <input className="number" type="number" step="0.01" value={yeastP} onChange={e=>setYeastP(safe(e.target.value,0))} />
          </div>

          {/* Save/Load UI */}
          <div className="row">
            <div className="label">Salvar / Carregar receitas</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="preset" onClick={saveRecipe}>Salvar receita</button>
              <button className="preset" onClick={importClick}>Importar CSV</button>
              <input ref={inputFileRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleFileInput} />
              <button className="preset" onClick={exportAllCsv}>Exportar todas (CSV)</button>
            </div>
          </div>

          <div className="row"><div className="label">Receitas Salvas</div>
            <div>
              {recipes.length===0 ? <div className="small-note">Nenhuma receita salva.</div> :
                recipes.map((r,i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', gap:8, alignItems:'center', padding:6, borderBottom:'1px dashed var(--border)'}}>
                    <div style={{fontWeight:600}}>{r.name}</div>
                    <div style={{display:'flex', gap:6}}>
                      <button className="preset" onClick={()=>loadRecipe(i)}>Carregar</button>
                      <button className="preset" onClick={()=>exportRecipeCsv(i)}>Exportar</button>
                      <button className="preset" onClick={()=>renameRecipe(i)}>Renomear</button>
                      <button className="preset" onClick={()=>deleteRecipe(i)}>Deletar</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Tools */}
          <div className="row">
            <div className="label">Ferramentas</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="preset" onClick={fracionarMassa}>Fracionar massa</button>
              <button className="preset" onClick={calculoReverso}>Cálculo reverso</button>
              <button className="preset" onClick={suggestYeast}>Sugerir % Fermento</button>
              <button className="preset" onClick={generateInstructions}>Gerar Instruções</button>
              <button className="preset" onClick={nutritionEstimate}>Estimativa Nutricional</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="results-grid">
            <div className="block">
              <div className="title">Resultados por bola (g)</div>
              <div className="item"><span>Farinha</span><span>{calc.byBall.flour}</span></div>
              <div className="item"><span>Água</span><span>{calc.byBall.water}</span></div>
              <div className="item"><span>Sal</span><span>{calc.byBall.salt}</span></div>
              <div className="item"><span>Óleo</span><span>{calc.byBall.oil}</span></div>
              <div className="item"><span>Azeite</span><span>{calc.byBall.olive}</span></div>
              <div className="item"><span>Açúcar</span><span>{calc.byBall.sugar}</span></div>
              <div className="item"><span>Fermento</span><span>{calc.byBall.yeast}</span></div>
              <div className="item total"><span>Total bola</span><span>{calc.byBall.total}</span></div>
            </div>

            <div className="block">
              <div className="title">Resultados totais</div>
              <div className="item"><span>Farinha</span><span>{calc.totals.flour}</span></div>
              <div className="item"><span>Água</span><span>{calc.totals.water}</span></div>
              <div className="item"><span>Sal</span><span>{calc.totals.salt}</span></div>
              <div className="item"><span>Óleo</span><span>{calc.totals.oil}</span></div>
              <div className="item"><span>Azeite</span><span>{calc.totals.olive}</span></div>
              <div className="item"><span>Açúcar</span><span>{calc.totals.sugar}</span></div>
              <div className="item"><span>Fermento</span><span>{calc.totals.yeast}</span></div>
              <div className="item total"><span>Massa total</span><span>{calc.totals.total}</span></div>
            </div>

            {prefType!=='None' && (
              <>
                <div className="block">
                  <div className="title">Preferment (totais)</div>
                  <div className="item"><span>Farinha</span><span>{calc.prefTotals.flour}</span></div>
                  <div className="item"><span>Água</span><span>{calc.prefTotals.water}</span></div>
                  <div className="item"><span>Fermento</span><span>{calc.prefTotals.yeast}</span></div>
                </div>
                <div className="block">
                  <div className="title">Massa final (totais)</div>
                  <div className="item"><span>Farinha</span><span>{calc.finalTotals.flour}</span></div>
                  <div className="item"><span>Água</span><span>{calc.finalTotals.water}</span></div>
                  <div className="item"><span>Sal</span><span>{calc.finalTotals.salt}</span></div>
                  <div className="item"><span>Óleo</span><span>{calc.finalTotals.oil}</span></div>
                  <div className="item"><span>Azeite</span><span>{calc.finalTotals.olive}</span></div>
                  <div className="item"><span>Açúcar</span><span>{calc.finalTotals.sugar}</span></div>
                  <div className="item"><span>Fermento</span><span>{calc.finalTotals.yeast}</span></div>
                </div>
              </>
            )}
          </div>
          <footer>
            <div>Farinha = Peso da bola ÷ (1 + soma dos percentuais)</div>
            <div>Ingredientes = Farinha × percentual</div>
            <div>Sugestões: IDY≈0.23%, ADY≈0.15%, CY≈0.7%, SSD≈0.1%, LSD≈0.02%</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
