export const BASE_PLUGIN_OPTIONS = {
  legend: {
    labels: {
      color: 'rgba(255,255,255,.75)',
      font: { size: 12 },
      boxWidth: 14,
      padding: 16,
    },
  },
  tooltip: {
    backgroundColor: 'rgba(8,18,40,.92)',
    titleColor: '#fff',
    bodyColor: 'rgba(255,255,255,.8)',
    borderColor: 'rgba(255,255,255,.12)',
    borderWidth: 1,
    padding: 10,
  },
}

export const scale = (unit: string) => ({
  ticks: {
    color: 'rgba(255,255,255,.55)',
    font: { size: 11 },
    callback: (v: any) => `${v}${unit}`,
  },
  grid: { color: 'rgba(255,255,255,.07)' },
})
