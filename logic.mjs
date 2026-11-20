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

// Foundation 0.4: a registry of user-entered fixtures. Registry status is NOT provider verification.
export const CUP_COUNTRIES = ['Engeland','Spanje','Duitsland','Italië','Frankrijk','Nederland'];
export const INTERNATIONAL = 'Internationaal';
export const MAIN_TOURNAMENTS = leagues.Internationaal;
export function competitionAllowed(country, competition, type) {
  if(type==='league') return (leagues[country]||[]).includes(competition) && country!==INTERNATIONAL;
  if(type==='international') return country===INTERNATIONAL && MAIN_TOURNAMENTS.includes(competition);
  if(type==='cup') return CUP_COUNTRIES.includes(country) && typeof competition==='string' && competition.trim().length>=3 && competition.trim().length<=100;
  return false;
}
export function validateFixture(fixture) {
  const errors=[];
  if(!competitionAllowed(fixture.country,fixture.competition,fixture.type)) errors.push('Land, toernooitype of competitienaam ongeldig.');
  const home=String(fixture.home||'').trim(),away=String(fixture.away||'').trim();
  if(!home || !away || home.length>100 || away.length>100) errors.push('Voer twee teamnamen in (maximaal 100 tekens).');
  if(home && away && home.toLocaleLowerCase('nl')===away.toLocaleLowerCase('nl')) errors.push('Teams moeten verschillen.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fixture.date||'') || !Number.isFinite(Date.parse(`${fixture.date}T12:00:00Z`)) || new Date(`${fixture.date}T12:00:00Z`).toISOString().slice(0,10)!==fixture.date) errors.push('Ongeldige wedstrijddatum.');
  if(fixture.type==='international' && fixture.mainStageConfirmed!==true) errors.push('Bevestig dat het een hoofdtoernooiwedstrijd is.');
  if(!String(fixture.source||'').trim()) errors.push('Vermeld een bronnotitie voor de wedstrijd.');
  if(String(fixture.source||'').length>300) errors.push('Bronnotitie is te lang.');
  return errors;
}
export function fixtureKey(f){return [f.country,f.type,f.competition.trim().toLocaleLowerCase('nl'),f.date,f.home.trim().toLocaleLowerCase('nl'),f.away.trim().toLocaleLowerCase('nl')].join('|')}
export function validateLinkedOdds(record, fixtures) {
  const fixture=fixtures.find(f=>f.id===record.fixtureId);
  if(!fixture) return ['Kies een geregistreerde wedstrijd.'];
  const errors=validate({...record,country:fixture.country,competition:fixture.type==='cup'?'':fixture.competition,home:fixture.home,away:fixture.away,date:fixture.date});
  return errors.filter(e=>!e.startsWith('Competitie valt buiten'));
}
export function exportFixtureCsv(rows){
  const cols=['id','country','type','competition','home','away','date','source','mainStageConfirmed','status','createdAt'];
  const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  return [cols.join(','),...rows.map(r=>cols.map(k=>esc(r[k])).join(','))].join('\r\n');
}
