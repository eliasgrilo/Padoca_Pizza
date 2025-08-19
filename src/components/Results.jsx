import React from 'react'
function fmt(v){ return (v>=1000?Math.round(v):Math.round(v*10)/10).toString().replace('.',',') }
export default function Results({state, results}){
  return (
    <div>
      <h3>Resultados por bola</h3>
      <div className="grid-results">
        <div className="pill">Farinha: {fmt(results.flourPerBall)} g</div>
        <div className="pill">Água: {fmt(results.waterPerBall)} g</div>
        <div className="pill">Sal: {fmt(results.saltPerBall)} g</div>
        <div className="pill">Gordura: {fmt(results.fatPerBall)} g</div>
        <div className="pill">Fermento: {fmt(results.yeastPerBall)} g</div>
        <div className="pill">Total bola: {fmt(results.totalPerBall)} g</div>
      </div>

      <h3 style={{marginTop:12}}>Totais</h3>
      <div className="grid-results">
        <div className="pill">Farinha total: {fmt(results.flourTotal)} g</div>
        <div className="pill">Água total: {fmt(results.waterTotal)} g</div>
        <div className="pill">Sal total: {fmt(results.saltTotal)} g</div>
        <div className="pill">Gordura total: {fmt(results.fatTotal)} g</div>
        <div className="pill">Fermento total: {fmt(results.yeastTotal)} g</div>
        <div className="pill">Massa total: {fmt(results.doughTotal)} g</div>
      </div>
    </div>
  )
}
