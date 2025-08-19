import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'

const STORAGE_KEY = 'pizzapp_react_recipes_v2'

export default function RecipeManager({state, setState, results}){
  const [list, setList] = useState([])
  const [msg, setMsg] = useState('')
  useEffect(()=>{ const raw = localStorage.getItem(STORAGE_KEY); setList(raw?JSON.parse(raw):[]) },[])

  function save(){
    const sum = (state.waterPct||0) + (state.fatsPct||0) + (state.saltPct||0) + (state.yeastPct||0)
    if(sum > 200){ alert('Soma dos percentuais excede 200% — ajuste antes de salvar.'); return; }
    const name = prompt('Nome da receita:')
    if(!name) return
    const r = {...state, name}
    const newList = [...list, r]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    setList(newList)
    setMsg('Receita salva')
    setTimeout(()=>setMsg(''),1500)
  }

  function load(idx){
    const r = list[idx]; if(!r) return
    setState({...r})
    setMsg('Receita carregada')
    setTimeout(()=>setMsg(''),1500)
  }

  function remove(idx){
    if(!confirm('Remover receita?')) return
    const arr = [...list]; arr.splice(idx,1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); setList(arr)
    setMsg('Receita removida'); setTimeout(()=>setMsg(''),1200)
  }

  function exportCurrentCSV(){
    const r = state
    const csv = `item,per_ball_g,total_g,percent_or_note\nflour,${results.flourPerBall},${results.flourTotal},-\nwater,${results.waterPerBall},${results.waterTotal},${r.waterPct}%\n`
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`pizzapp_${(r.name||'recipe')}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  function exportAll(){
    if(list.length===0){ alert('Nenhuma receita'); return }
    let csv = 'name,balls,ballWeight,waterPct,fatsPct,saltPct,yeastPct,rtH,rtT,ctH,ctT\n'
    list.forEach(r => {
      csv += `"${r.name}",${r.balls},${r.ballWeight},${r.waterPct},${r.fatsPct},${r.saltPct},${r.yeastPct},${r.rtH},${r.rtT},${r.ctH},${r.ctT}\n`
    })
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='pizzapp_all_recipes.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  function exportPDF(){
    const r = state
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('PizzApp — Ficha de Produção', 14, 20)
    doc.setFontSize(11)
    doc.text(`Receita: ${r.name || 'untitled'}`, 14, 34)
    doc.text(`Bolas: ${r.balls}  |  Peso por bola: ${r.ballWeight} g`, 14, 46)
    doc.text(`RT: ${r.rtH}h @ ${r.rtT}°C   CT: ${r.ctH}h @ ${r.ctT}°C`, 14, 58)
    doc.text('Ingredientes (por bola / total):', 14, 76)
    const startY = 88
    const lines = [
      `Farinha: ${Math.round(results.flourPerBall*10)/10} g / ${Math.round(results.flourTotal*10)/10} g`,
      `Água: ${Math.round(results.waterPerBall*10)/10} g / ${Math.round(results.waterTotal*10)/10} g (${r.waterPct}%)`,
      `Gordura: ${Math.round(results.fatPerBall*10)/10} g / ${Math.round(results.fatTotal*10)/10} g (${r.fatsPct}%)`,
      `Sal: ${Math.round(results.saltPerBall*10)/10} g / ${Math.round(results.saltTotal*10)/10} g (${r.saltPct}%)`,
      `Fermento: ${Math.round(results.yeastPerBall*10)/10} g / ${Math.round(results.yeastTotal*10)/10} g (${r.yeastPct}%)`
    ]
    lines.forEach((ln,i)=> doc.text(ln, 14, startY + i*12))
    doc.save(`pizzapp_${(r.name||'recipe')}.pdf`)
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={save} className="btn">Salvar</button>
        <button onClick={exportCurrentCSV} className="btn secondary">Exportar CSV</button>
        <button onClick={exportPDF} className="btn secondary">Exportar PDF</button>
        <button onClick={()=>window.print()} className="btn secondary">Imprimir</button>
        <button onClick={exportAll} className="btn secondary">Exportar todas</button>
      </div>

      <div style={{marginTop:10}}>
        <strong>Receitas salvas</strong>
        <div style={{marginTop:6}}>
          {list.length===0 ? <div className="small">Nenhuma receita.</div> : list.map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}>
              <div><strong>{r.name}</strong> <span className="small">({r.balls}x{r.ballWeight}g)</span></div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>load(i)} className="btn secondary">Carregar</button>
                <button onClick={()=>remove(i)} className="btn secondary">Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:8}} className="small">{msg}</div>
    </div>
  )
}
