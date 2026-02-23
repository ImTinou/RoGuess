// Tableau de comparaison style Loldle
// Chaque guess = une ligne avec des cellules colorées par attribut

const STATUS_CLASS = {
  correct: 'cell-correct',
  partial: 'cell-partial',
  wrong:   'cell-wrong',
  high:    'cell-high',
  low:     'cell-low',
}

const ARROW = { high: '↓', low: '↑' }

const COLUMNS = {
  game: [
    { key: 'genre',   label: 'GENRE' },
    { key: 'year',    label: 'ANNÉE' },
    { key: 'visits',  label: 'VISITES' },
    { key: 'creator', label: 'CRÉATEUR' },
    { key: 'free',    label: 'GRATUIT' },
  ],
  limited: [
    { key: 'type',   label: 'TYPE' },
    { key: 'year',   label: 'ANNÉE' },
    { key: 'rap',    label: 'RAP' },
    { key: 'rarity', label: 'RARETÉ' },
  ],
  dev: [
    { key: 'genre',     label: 'GENRE' },
    { key: 'year',      label: 'DEPUIS' },
    { key: 'followers', label: 'FOLLOWERS' },
    { key: 'known_for', label: 'CONNU POUR' },
  ],
}

const NAME_LABEL = { game: 'JEU', limited: 'ITEM', dev: 'DEV' }

function Cell({ data }) {
  if (!data) return <td className="cmp-cell cell-wrong">?</td>
  const cls   = STATUS_CLASS[data.status] ?? 'cell-wrong'
  const arrow = ARROW[data.status]
  return (
    <td className={`cmp-cell ${cls}`}>
      <span className="cmp-cell-value">{data.display ?? data.value}</span>
      {arrow && <span className="cmp-cell-arrow">{arrow}</span>}
    </td>
  )
}

export default function ComparisonTable({ mode, rows }) {
  if (!rows?.length) return null

  const cols = COLUMNS[mode] ?? []

  return (
    <div className="cmp-wrapper">
      {/* Légende */}
      <div className="cmp-legend">
        <span className="legend-dot cell-correct" />Correct
        <span className="legend-dot cell-partial" />Proche
        <span className="legend-dot cell-wrong"   />Incorrect
        <span style={{ marginLeft: 4 }}>↑↓ direction</span>
      </div>

      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-th cmp-th-img" />
              <th className="cmp-th cmp-th-name">{NAME_LABEL[mode] ?? 'NOM'}</th>
              {cols.map(c => <th key={c.key} className="cmp-th">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map((row, i) => (
              <tr key={i} className="cmp-row">
                <td className="cmp-td-img">
                  {row.thumbnail
                    ? <img src={row.thumbnail} alt={row.name} className="cmp-thumb" onError={e => { e.target.style.display = 'none' }} />
                    : <div className="cmp-thumb-placeholder" />
                  }
                </td>
                <td className="cmp-td-name">{row.name}</td>
                {cols.map(c => <Cell key={c.key} data={row.comparison?.[c.key]} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
