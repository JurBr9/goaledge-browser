export const leagues = {
  Engeland: ['Premier League','Championship'],
  Spanje: ['La Liga','Segunda División'],
  Duitsland: ['Bundesliga','2. Bundesliga'],
  Italië: ['Serie A','Serie B'],
  Frankrijk: ['Ligue 1','Ligue 2'],
  Nederland: ['Eredivisie','Keuken Kampioen Divisie'],
  Internationaal: ['FIFA World Cup','UEFA EURO','UEFA Nations League','UEFA Champions League','UEFA Europa League','UEFA Conference League']
};
export const MARKETS = ['1','X','2','1X','X2','12','Over 2.5','Under 2.5','BTTS Ja','BTTS Nee'];
export function validate(record) {
  const errors=[];
  if (!leagues[record.country]?.includes(record.competition)) errors.push('Competitie valt buiten de geverifieerde keuzelijst.');
  if (!record.home?.trim() || !record.away?.trim()) errors.push('Beide teamnamen zijn verplicht.');
  if (record.home?.trim().toLowerCase() === record.away?.trim().toLowerCase()) errors.push('Thuis- en uitteam moeten verschillen.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date || '') || !Number.isFinite(Date.parse(`${record.date}T12:00:00Z`)) || new Date(`${record.date}T12:00:00Z`).toISOString().slice(0,10)!==record.date) errors.push('Ongeldige wedstrijddatum.');
  if (!MARKETS.includes(record.market)) errors.push('Ongeldige markt.');
  const odds=Number(record.odds);
  if (!Number.isFinite(odds) || odds<=1 || odds>1000) errors.push('Decimale TOTO-odds moeten groter dan 1 en maximaal 1000 zijn.');
  if (!record.source?.trim()) errors.push('Vermeld waar je de TOTO-odds hebt gezien.');
  if (!record.observedAt || !Number.isFinite(Date.parse(record.observedAt))) errors.push('Tijdstip van oddswaarneming ontbreekt.');
  else if (Date.parse(record.observedAt)>Date.now()+60000) errors.push('Waarneming kan niet in de toekomst liggen.');
  return errors;
}
export function impliedProbability(odds){return 100/Number(odds)}
export function toCsv(rows){
  const cols=['date','country','competition','home','away','market','odds','source','observedAt','createdAt'];
  const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  return [cols.join(','),...rows.map(r=>cols.map(c=>escape(r[c])).join(','))].join('\r\n');
}
