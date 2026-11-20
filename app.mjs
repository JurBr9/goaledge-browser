import {leagues,MARKETS,validate,impliedProbability,toCsv} from './logic.mjs';
const KEY='goaledge-v03-observations';
const country=document.querySelector('#country'),competition=document.querySelector('#competition'),market=document.querySelector('#market'),form=document.querySelector('#entry'),feedback=document.querySelector('#feedback');
for(const name of Object.keys(leagues))country.add(new Option(name,name));
for(const name of MARKETS)market.add(new Option(name,name));
function updateCompetitions(){competition.replaceChildren(...leagues[country.value].map(x=>new Option(x,x)))}
country.addEventListener('change',updateCompetitions);updateCompetitions();
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function save(rows){localStorage.setItem(KEY,JSON.stringify(rows))}
function render(){const rows=read();document.querySelector('#count').textContent=String(rows.length);const body=document.querySelector('#records');body.replaceChildren();for(const r of rows.slice().reverse()){const tr=document.createElement('tr');for(const v of [`${r.home} – ${r.away}`,r.date,r.competition,r.market,r.odds,`${impliedProbability(r.odds).toFixed(1)}%`,new Date(r.observedAt).toLocaleString('nl-NL')]){const td=document.createElement('td');td.textContent=v;tr.append(td)}body.append(tr)}}
form.addEventListener('submit',e=>{e.preventDefault();const r=Object.fromEntries(new FormData(form));r.home=r.home.trim();r.away=r.away.trim();r.source=r.source.trim();const errors=validate(r);feedback.className=errors.length?'alert':'ok';if(errors.length){feedback.textContent=errors.join(' ');return}r.observedAt=new Date(r.observedAt).toISOString();r.createdAt=new Date().toISOString();try{const rows=read();rows.push(r);save(rows);feedback.textContent='Waarneming lokaal opgeslagen. De wedstrijd en odd zijn niet onafhankelijk geverifieerd.';form.reset();country.value='Engeland';updateCompetitions();render()}catch{feedback.className='alert';feedback.textContent='Opslaan mislukt: browseropslag is niet beschikbaar.'}});
document.querySelector('#export').addEventListener('click',()=>{const csv='\ufeff'+toCsv(read());const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='goaledge-toto-waarnemingen.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
document.querySelector('#clear').addEventListener('click',()=>{if(confirm('Alle lokaal opgeslagen GoalEdge-waarnemingen definitief wissen?')){localStorage.removeItem(KEY);render();feedback.textContent='Lokale gegevens gewist.';feedback.className='ok'}});
render();
