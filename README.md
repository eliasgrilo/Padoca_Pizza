# Padoca Pizza — React + Vite (Improved)

Este projeto implementa as melhorias solicitadas:

- **Categorias após "Tipo de Fermentação"**
  - *Categoria 1: Ingredientes* (Water, Sugar, Salt, Olive Oil, Oil, Milk)
  - *Categoria 2: Time | Temperature* (RT leavening (h), RT °C, CT leavening (h), CT °C)
- **Yeast Type** com clique para revelar o nome completo:
  - CY → *Compressed Yeast*
  - IDY → *Instant Dry Yeast*
  - ADY → *Active Dry Yeast*
- **Formatação aprimorada**: valores alinhados à direita, casas decimais fixas, sufixo %.
- **Teclado numérico no mobile**: `type="number"`, `inputMode="decimal|numeric"`, `pattern`.
- **Código revisado** e pronto para Vite.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```