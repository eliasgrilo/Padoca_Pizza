import React, { useEffect, useMemo, useState, useRef } from "react";
import "./App.css";

const YEAST_SUGGESTIONS = { IDY: 0.23, ADY: 0.15, CY: 0.7, SSD: 0.1, LSD: 0.02 };
const PREF_SUGGESTIONS = {
  Poolish: { flour: 30, water: 100, yeast: 0.3 },
  Biga: { flour: 30, water: 50, yeast: 0.1 },
  Levain: { flour: 20, water: 100, yeast: 0 }
};
const safe = (n, d = 0) => Number.isFinite(+n) ? +n : d;

export default function App() {
  // theme (manual toggle in addition to prefers-color-scheme)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto'); // 'light' | 'dark' | 'auto'
  useEffect(() => {
    const root = document.documentElement;
    if(theme === 'auto'){
      root.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }else{
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // inputs
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

  // recipes
  const [recipes, setRecipes] = useState([]);
  const fileRef = useRef(null);

  // load state
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("padoca_pizza_state") || "null");
      if (s) {
        setDoughBalls(s.doughBalls || 1);
        setBallWeight(s.ballWeight || 250);
        setWaterP(s.waterP || 60);
        setOilP(s.oilP || 0);
        setOliveOilP(s.oliveOilP || 0);
        setSaltP(s.saltP || 2.5);
        setSugarP(s.sugarP || 0);
        setRtH(s.rtH || 0); setRtT(s.rtT || 25);
        setCtH(s.ctH || 0); setCtT(s.ctT || 4);
        setYeastType(s.yeastType || "IDY");
        setYeastP(s.yeastP || YEAST_SUGGESTIONS["IDY"]);
        setPrefType(s.prefType || "None");
        setPrefFlourP(s.prefFlourP || 0);
        setPrefWaterP(s.prefWaterP || 0);
        setPrefYeastP(s.prefYeastP || 0);
      }
      const r = JSON.parse(localStorage.getItem("padoca_pizza_recipes") || "null");
      if (Array.isArray(r)) setRecipes(r);
    } catch (e) {
      console.error("load error", e);
    }
  }, []);

  useEffect(() => {
    const d = { doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP, rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP };
    localStorage.setItem("padoca_pizza_state", JSON.stringify(d));
  }, [doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP, rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP]);

  useEffect(() => localStorage.setItem("padoca_pizza_recipes", JSON.stringify(recipes)), [recipes]);
  useEffect(() => setYeastP(YEAST_SUGGESTIONS[yeastType] ?? 0), [yeastType]);
  useEffect(() => {
    if (prefType === "None") { setPrefFlourP(0); setPrefWaterP(0); setPrefYeastP(0); return; }
    const s = PREF_SUGGESTIONS[prefType] || { flour: 0, water: 0, yeast: 0 };
    setPrefFlourP(s.flour); setPrefWaterP(s.water); setPrefYeastP(s.yeast);
  }, [prefType]);

  const calc = useMemo(() => {
    const sumFat = safe(oilP) + safe(oliveOilP);
    const sumPerc = safe(waterP) + sumFat + safe(saltP) + safe(sugarP) + safe(yeastP);
    const flourBall = safe(ballWeight) / (1 + sumPerc / 100);
    const waterBall = flourBall * safe(waterP) / 100;
    const oilBall = flourBall * safe(oilP) / 100;
    const oliveBall = flourBall * safe(oliveOilP) / 100;
    const saltBall = flourBall * safe(saltP) / 100;
    const sugarBall = flourBall * safe(sugarP) / 100;
    const yeastBall = flourBall * safe(yeastP) / 100;

    const prefFlour = prefType === "None" ? 0 : flourBall * safe(prefFlourP) / 100;
    const prefWater = prefType === "None" ? 0 : prefFlour * safe(prefWaterP) / 100;
    const prefYeast = prefType === "None" ? 0 : prefFlour * safe(prefYeastP) / 100;

    const finalFlour = flourBall - prefFlour;
    const finalWater = waterBall - prefWater;

    const byBall = {
      flour: Math.round(flourBall), water: Math.round(waterBall), salt: Math.round(saltBall),
      oil: Math.round(oilBall), olive: Math.round(oliveBall), sugar: Math.round(sugarBall),
      yeast: +(yeastBall.toFixed(2)), total: Math.round(ballWeight)
    };
    const totals = {
      flour: Math.round(flourBall * safe(doughBalls, 1)), water: Math.round(waterBall * safe(doughBalls, 1)),
      salt: Math.round(saltBall * safe(doughBalls, 1)), oil: Math.round(oilBall * safe(doughBalls, 1)),
      olive: Math.round(oliveBall * safe(doughBalls, 1)), sugar: Math.round(sugarBall * safe(doughBalls, 1)),
      yeast: +(yeastBall * safe(doughBalls, 1)).toFixed(2), total: Math.round(ballWeight * safe(doughBalls, 1))
    };
    const prefTotals = { flour: Math.round(prefFlour * safe(doughBalls, 1)), water: Math.round(prefWater * safe(doughBalls, 1)), yeast: +(prefYeast * safe(doughBalls, 1)).toFixed(2) };
    const finalTotals = {
      flour: Math.round(finalFlour * safe(doughBalls, 1)), water: Math.round(finalWater * safe(doughBalls, 1)),
      salt: Math.round(saltBall * safe(doughBalls, 1)), oil: Math.round(oilBall * safe(doughBalls, 1)),
      olive: Math.round(oliveBall * safe(doughBalls, 1)), sugar: Math.round(sugarBall * safe(doughBalls, 1)),
      yeast: +((yeastBall - prefYeast) * safe(doughBalls, 1)).toFixed(2)
    };
    return { byBall, totals, prefTotals, finalTotals };
  }, [ballWeight, doughBalls, waterP, oilP, oliveOilP, saltP, sugarP, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP]);

  // recipes actions
  const saveRecipe = () => {
    const name = window.prompt("Nome da receita:");
    if (!name) return;
    const entry = { name: name.trim(), data: { doughBalls, ballWeight, waterP, oilP, oliveOilP, saltP, sugarP, rtH, rtT, ctH, ctT, yeastType, yeastP, prefType, prefFlourP, prefWaterP, prefYeastP } };
    setRecipes(prev => [...prev, entry]);
    alert("Receita salva.");
  };
  const loadRecipe = i => {
    const r = recipes[i]; if (!r) return; const d = r.data;
    setDoughBalls(safe(d.doughBalls, 1)); setBallWeight(safe(d.ballWeight, 250));
    setWaterP(safe(d.waterP, 60)); setOilP(safe(d.oilP, 0)); setOliveOilP(safe(d.oliveOilP, 0));
    setSaltP(safe(d.saltP, 2.5)); setSugarP(safe(d.sugarP, 0));
    setRtH(safe(d.rtH, 0)); setRtT(safe(d.rtT, 25)); setCtH(safe(d.ctH, 0)); setCtT(safe(d.ctT, 4));
    setYeastType(d.yeastType || "IDY"); setYeastP(safe(d.yeastP, YEAST_SUGGESTIONS["IDY"]));
    setPrefType(d.prefType || "None"); setPrefFlourP(safe(d.prefFlourP, 0)); setPrefWaterP(safe(d.prefWaterP, 0)); setPrefYeastP(safe(d.prefYeastP, 0));
    alert(`Receita '${r.name}' carregada.`);
  };
  const deleteRecipe = i => { if (!confirm("Deletar receita?")) return; setRecipes(prev => prev.filter((_, idx) => idx !== i)); };
  const renameRecipe = i => { const n = prompt("Novo nome:", recipes[i]?.name || ""); if (!n) return; setRecipes(prev => prev.map((r, idx) => idx === i ? { ...r, name: n.trim() } : r)); };

  const exportRecipeCsv = i => {
    const r = recipes[i]; if (!r) { alert("Selecione receita"); return; }
    const hdr = ["name","doughBalls","ballWeight","waterP","oilP","oliveOilP","saltP","sugarP","rtH","rtT","ctH","ctT","yeastType","yeastP","prefType","prefFlourP","prefWaterP","prefYeastP"];
    const d = r.data; const row = [r.name, d.doughBalls, d.ballWeight, d.waterP, d.oilP, d.oliveOilP, d.saltP, d.sugarP, d.rtH, d.rtT, d.ctH, d.ctT, d.yeastType, d.yeastP, d.prefType, d.prefFlourP, d.prefWaterP, d.prefYeastP];
    const csv = hdr.join(",") + "\n" + row.join(",");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${r.name.replace(/\s+/g, "_")}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  const exportAllCsv = () => {
    if (!recipes.length) { alert("Nenhuma receita salva"); return; }
    const hdr = ["name","doughBalls","ballWeight","waterP","oilP","oliveOilP","saltP","sugarP","rtH","rtT","ctH","ctT","yeastType","yeastP","prefType","prefFlourP","prefWaterP","prefYeastP"];
    const lines = recipes.map(r => { const d = r.data; return [r.name, d.doughBalls, d.ballWeight, d.waterP, d.oilP, d.oliveOilP, d.saltP, d.sugarP, d.rtH, d.rtT, d.ctH, d.ctT, d.yeastType, d.yeastP, d.prefType, d.prefFlourP, d.prefWaterP, d.prefYeastP].join(",") });
    const csv = hdr.join(",") + "\n" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "padoca_recipes_export.csv"; document.body.appendChild(a); a.click(); a.remove();
  };

  const handleImport = file => {
    if (!file) return; const reader = new FileReader(); reader.onload = e => {
      const text = String(e.target.result || ""); const lines = text.split(/\r?\n/).filter(l => l.trim()); if (!lines.length) return;
      const header = lines[0].split(","); const rows = lines.slice(1);
      const imported = rows.map(row => { const vals = row.split(","); const obj = {}; header.forEach((h, idx) => obj[h] = vals[idx]); const data = {
        doughBalls: safe(parseFloat(obj.doughBalls) || 0, 1),
        ballWeight: safe(parseFloat(obj.ballWeight) || 0, 250),
        waterP: safe(parseFloat(obj.waterP) || 0, 0),
        oilP: safe(parseFloat(obj.oilP) || 0, 0),
        oliveOilP: safe(parseFloat(obj.oliveOilP) || 0, 0),
        saltP: safe(parseFloat(obj.saltP) || 0, 0),
        sugarP: safe(parseFloat(obj.sugarP) || 0, 0),
        rtH: safe(parseFloat(obj.rtH) || 0, 0),
        rtT: safe(parseFloat(obj.rtT) || 0, 0),
        ctH: safe(parseFloat(obj.ctH) || 0, 0),
        ctT: safe(parseFloat(obj.ctT) || 0, 0),
        yeastType: obj.yeastType || "IDY",
        yeastP: safe(parseFloat(obj.yeastP) || 0, 0),
        prefType: obj.prefType || "None",
        prefFlourP: safe(parseFloat(obj.prefFlourP) || 0, 0),
        prefWaterP: safe(parseFloat(obj.prefWaterP) || 0, 0),
        prefYeastP: safe(parseFloat(obj.prefYeastP) || 0, 0)
      }; return { name: obj.name || "Imported", data }; });
      setRecipes(prev => [...prev, ...imported]); alert(`Importadas ${imported.length} receitas.`);
    }; reader.readAsText(file);
  };

  // tools
  const fracionarMassa = () => { const total = prompt("Informe o peso total da massa (g):"); const n = parseFloat(total); if (!Number.isFinite(n) || n <= 0) { alert("Valor inválido"); return; } const num = Math.floor(n / ballWeight); const rem = n % ballWeight; alert(`Pode fracionar em ${num} bolas de ${ballWeight}g, sobra ${rem.toFixed(1)}g`); };
  const calculoReverso = () => { const totalFlour = prompt("Informe a quantidade total de farinha (g):"); const n = parseFloat(totalFlour); if (!Number.isFinite(n) || n <= 0) { alert("Valor inválido"); return; } const sumP = (safe(waterP) + safe(oilP) + safe(oliveOilP) + safe(saltP) + safe(sugarP) + safe(yeastP)) / 100; const flourPerBall = n / doughBalls; const newBall = Math.round(flourPerBall * (1 + sumP)); setBallWeight(newBall); alert(`Novo peso por bola calculado: ${newBall} g`); };
  const suggestYeast = () => { const totalTime = (safe(rtH) + safe(ctH)) || 24; const avgTemp = ((safe(rtH) * safe(rtT)) + (safe(ctH) * safe(ctT))) / (safe(rtH) + safe(ctH) || 1); let base = 0.6 / totalTime; base *= Math.pow(1.035, 20 - avgTemp); base = Math.max(0.02, Math.min(1, base)); setYeastP(+base.toFixed(2)); alert(`Sugestão de fermento: ${base.toFixed(2)}%`); };
  const generateInstructions = () => { let steps = `Receita — ${doughBalls} bolas de ${ballWeight}g\n\n`; if (prefType !== "None") { steps += `Prefermento (${prefType}): ${calc.prefTotals.flour}g farinha, ${calc.prefTotals.water}g água, ${calc.prefTotals.yeast}g fermento.\n`; steps += `Massa final: ${calc.finalTotals.flour}g farinha, ${calc.finalTotals.water}g água.\n`; } else { steps += `Misture todos os ingredientes: ${calc.totals.flour}g farinha, ${calc.totals.water}g água, etc.\n`; } steps += `RT: ${rtH}h @ ${rtT}°C. CT: ${ctH}h @ ${ctT}°C.`; alert(steps); };
  const nutritionEstimate = () => { const calFlour = 3.5, calFat = 9, calSugar = 4; const flour = calc.byBall.flour, fat = calc.byBall.oil + calc.byBall.olive, sugar = calc.byBall.sugar; const kcal = Math.round(flour * calFlour + fat * calFat + sugar * calSugar); alert(`Estimativa por bola: ${kcal} kcal`); };

  // small helpers
  const resetDefaults = () => {
    if (!confirm("Resetar para valores padrão?")) return;
    setDoughBalls(1); setBallWeight(250); setWaterP(60); setOilP(0); setOliveOilP(0); setSaltP(2.5); setSugarP(0);
    setRtH(0); setRtT(25); setCtH(0); setCtT(4); setYeastType("IDY"); setYeastP(YEAST_SUGGESTIONS["IDY"]); setPrefType("None"); setPrefFlourP(0); setPrefWaterP(0); setPrefYeastP(0);
  };

  const clearRecipes = () => { if (!confirm("Limpar todas as receitas salvas?")) return; setRecipes([]); alert("Receitas limpas."); };

  const onFileChange = e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; };

  
  const exportCSV = () => {
    const rows = [];
    rows.push(['Configuração']);
    rows.push(['Bolas de massa', doughBalls]);
    rows.push(['Peso por bola (g)', ballWeight]);
    rows.push([]);
    rows.push(['Percentuais']);
    rows.push(['Água %', waterP], ['Sal %', saltP], ['Óleo %', oilP], ['Azeite %', oliveOilP], ['Açúcar %', sugarP], ['Fermento %', yeastP]);
    rows.push([]);
    rows.push(['Prefermento', prefType]);
    if(prefType !== 'None'){
      rows.push(['Farinha Pref %', prefFlourP], ['Água Pref %', prefWaterP], ['Fermento Pref %', prefYeastP]);
    }
    rows.push([]);
    rows.push(['Resultados por bola (g)']);
    Object.entries(calc.byBall).forEach(([k,v])=> rows.push([k, v]));
    rows.push([]);
    rows.push(['Resultados totais (g)']);
    Object.entries(calc.totals).forEach(([k,v])=> rows.push([k, v]));
    if(prefType !== 'None'){
      rows.push([]);
      rows.push(['Prefermento (totais)']);
      Object.entries(calc.prefTotals).forEach(([k,v])=> rows.push([k, v]));
      rows.push(['Massa final (totais)']);
      Object.entries(calc.finalTotals).forEach(([k,v])=> rows.push([k, v]));
    }
    const csv = rows.map(r => r.map(x => (x==null?'':String(x)).replaceAll('"','""')).map(x=>`"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'padoca_calculo.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };
return (
    <div className="app">
      <header>
        <h1>Padoca Pizza — Calculadora</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="reset" onClick={()=>setTheme(t=> t==='auto'?'dark': t==='dark'?'light':'auto')}>Tema: {theme}</button>
          <button className="reset" onClick={exportCSV}>Exportar CSV</button>
          <button className="reset" onClick={resetDefaults}>Reset padrões</button>
          <button className="reset" onClick={clearRecipes}>Limpar receitas</button>
        </div>
      </header>

      <div className="grid">
        <div className="card">

          {/* Dough group */}
          <table className="table" aria-label="Dough">
            <tbody>
              <tr>
                <th><label htmlFor="doughBalls">Dough Balls</label></th>
                <td>
                  <div className="row-buttons">
                    <button className="btn" onClick={()=>setDoughBalls(v=>Math.max(1,v-1))}>−</button>
                    <input id="doughBalls" className="input" type="number" value={doughBalls} onChange={e=>setDoughBalls(Math.max(1,parseInt(e.target.value||0)))} />
                    <button className="btn" onClick={()=>setDoughBalls(v=>v+1)}>+</button>
                  </div>
                </td>
              </tr>
              <tr>
                <th><label htmlFor="ballWeight">Ball Weight (g)</label></th>
                <td>
                  <div className="row-buttons">
                    <button className="btn" onClick={()=>setBallWeight(v=>Math.max(10,v-10))}>−</button>
                    <input id="ballWeight" className="input" type="number" value={ballWeight} onChange={e=>setBallWeight(Math.max(10,parseInt(e.target.value||0)))} />
                    <button className="btn" onClick={()=>setBallWeight(v=>v+10)}>+</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Fermentation group with fieldset/legend to ensure visibility */}
          <fieldset style={{border:'1px solid var(--border)',padding:10,borderRadius:8,marginBottom:12}}>
            <legend style={{fontWeight:700,color:'var(--muted)'}}>Tipo de Fermentação</legend>
            <div className="controls-row" role="radiogroup" aria-label="Tipo de fermentação">
              {['None','Poolish','Biga','Levain'].map(t => (
                <button key={t} aria-pressed={t===prefType} className={`preset ${t===prefType?'active':''}`} onClick={()=>setPrefType(t)}>{t}</button>
              ))}
            </div>
            {prefType !== 'None' && (
              <div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8}}>
                <label style={{fontSize:13,color:'var(--muted)'}}>Farinha Pref (% total farinha)
                  <input className="input" value={prefFlourP} onChange={e=>setPrefFlourP(safe(e.target.value,0))} />
                </label>
                <label style={{fontSize:13,color:'var(--muted)'}}>Água Pref (% pref farinha)
                  <input className="input" value={prefWaterP} onChange={e=>setPrefWaterP(safe(e.target.value,0))} />
                </label>
                <label style={{fontSize:13,color:'var(--muted)'}}>Fermento Pref (% pref farinha)
                  <input className="input" value={prefYeastP} onChange={e=>setPrefYeastP(safe(e.target.value,0))} />
                </label>
              </div>
            )}
          </fieldset>

          {/* Percentages - individual rows */}
          <table className="table" aria-label="Percentages">
            <tbody>
              <tr><th><label htmlFor="waterP">Water (%)</label></th><td><input id="waterP" className="input" type="number" value={waterP} onChange={e=>setWaterP(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="oilP">Oil (%)</label></th><td><input id="oilP" className="input" type="number" value={oilP} onChange={e=>setOilP(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="oliveOilP">Olive Oil (%)</label></th><td><input id="oliveOilP" className="input" type="number" value={oliveOilP} onChange={e=>setOliveOilP(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="saltP">Salt (%)</label></th><td><input id="saltP" className="input" type="number" value={saltP} onChange={e=>setSaltP(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="sugarP">Sugar (%)</label></th><td><input id="sugarP" className="input" type="number" value={sugarP} onChange={e=>setSugarP(safe(e.target.value,0))} /></td></tr>
            </tbody>
          </table>

          {/* RT/CT individual rows */}
          <table className="table" aria-label="Times and Temperatures">
            <tbody>
              <tr><th><label htmlFor="rtH">RT leavening (h)</label></th><td><input id="rtH" className="input" type="number" value={rtH} onChange={e=>setRtH(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="rtT">RT °C</label></th><td><input id="rtT" className="input" type="number" value={rtT} onChange={e=>setRtT(safe(e.target.value,25))} /></td></tr>
              <tr><th><label htmlFor="ctH">CT leavening (h)</label></th><td><input id="ctH" className="input" type="number" value={ctH} onChange={e=>setCtH(safe(e.target.value,0))} /></td></tr>
              <tr><th><label htmlFor="ctT">CT °C</label></th><td><input id="ctT" className="input" type="number" value={ctT} onChange={e=>setCtT(safe(e.target.value,4))} /></td></tr>
            </tbody>
          </table>

          {/* Yeast */}
          <table className="table" aria-label="Yeast">
            <tbody>
              <tr>
                <th><label>Yeast Type</label></th>
                <td>
                  <div className="controls-row" role="radiogroup" aria-label="Yeast type">
                    {Object.keys(YEAST_SUGGESTIONS).map(k => (
                      <button key={k} aria-pressed={k===yeastType} className={`preset ${k===yeastType?'active':''}`} onClick={()=>setYeastType(k)}>{k}</button>
                    ))}
                  </div>
                </td>
              </tr>
              <tr><th><label htmlFor="yeastP">Yeast (%)</label></th><td><input id="yeastP" className="input" type="number" step="0.01" value={yeastP} onChange={e=>setYeastP(safe(e.target.value,0))} /></td></tr>
            </tbody>
          </table>

          {/* Save / Load / Recipes */}
          <table className="table" aria-label="Recipes">
            <tbody>
              <tr>
                <th>Salvar / Carregar receitas</th>
                <td style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="btn" onClick={saveRecipe}>Salvar receita</button>
                  <button className="btn" onClick={()=>fileRef.current?.click()}>Importar CSV</button>
                  <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={onFileChange} />
                  <button className="btn" onClick={exportAllCsv}>Exportar todas (CSV)</button>
                </td>
              </tr>
              <tr>
                <th>Receitas Salvas</th>
                <td>
                  {recipes.length===0 ? <div className="small">Nenhuma receita salva.</div> : recipes.map((r,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px dashed var(--border)'}}>
                      <div style={{fontWeight:600}}>{r.name}</div>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn" onClick={()=>loadRecipe(i)}>Carregar</button>
                        <button className="btn" onClick={()=>exportRecipeCsv(i)}>Exportar</button>
                        <button className="btn" onClick={()=>renameRecipe(i)}>Renomear</button>
                        <button className="btn" onClick={()=>deleteRecipe(i)}>Deletar</button>
                      </div>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tools */}
          <table className="table" aria-label="Tools">
            <tbody>
              <tr>
                <th>Ferramentas</th>
                <td>
                  <div className="tools-grid">
                    <button className="btn" onClick={fracionarMassa}>Fracionar massa</button>
                    <button className="btn" onClick={calculoReverso}>Cálculo reverso</button>
                    <button className="btn" onClick={suggestYeast}>Sugerir % Fermento</button>
                    <button className="btn" onClick={generateInstructions}>Gerar Instruções</button>
                    <button className="btn" onClick={nutritionEstimate}>Estimativa Nutricional</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

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
              <div className="item total"><span>Total</span><span>{calc.byBall.total}</span></div>
              <div style={{marginTop:10}} aria-label="Visualização por bola">
                <svg viewBox="0 0 320 120" width="100%" role="img">
                  {(() => {
                    const data = [
                      ['Farinha', calc.byBall.flour],
                      ['Água', calc.byBall.water],
                      ['Sal', calc.byBall.salt],
                      ['Óleo', calc.byBall.oil],
                      ['Azeite', calc.byBall.olive],
                      ['Açúcar', calc.byBall.sugar],
                      ['Fermento', calc.byBall.yeast],
                    ];
                    const max = Math.max(...data.map(d=>d[1]||0), 1);
                    const barW = 40, gap = 8;
                    return data.map((d, i) => {
                      const h = Math.round((d[1]/max)*90);
                      const x = 10 + i*(barW+gap);
                      const y = 100 - h;
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={barW} height={h} rx="6" ry="6" fill="currentColor" opacity="0.2"></rect>
                          <text x={x+barW/2} y="112" textAnchor="middle" fontSize="10">{d[0]}</text>
                          <text x={x+barW/2} y={y-4} textAnchor="middle" fontSize="10">{d[1]}</text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>

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

            {prefType !== "None" && (
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

          <div className="footer">Farinha = Peso da bola ÷ (1 + soma dos percentuais). Ingredientes = Farinha × percentual.</div>
        </div>
      </div>
    </div>
  );
}
