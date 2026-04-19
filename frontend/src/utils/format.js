export const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))

export const dateBR = (v) =>
  new Date(v + 'T00:00:00').toLocaleDateString('pt-BR')

export const monthName = (v) => {
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [, m] = v.split('-')
  return months[parseInt(m) - 1]
}

export const today = () => new Date().toISOString().slice(0, 10)

export const currentMonth = () => new Date().toISOString().slice(0, 7)
