export function loadAllRecipes(){
  try{
    const raw = localStorage.getItem('padoca_recipes_v1') || '{}'
    return JSON.parse(raw)
  }catch(e){ return {} }
}

export function saveAllRecipes(obj){
  localStorage.setItem('padoca_recipes_v1', JSON.stringify(obj))
}