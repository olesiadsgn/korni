/* Логика книги: родство, страницы, карточки, карта, хроника, древо. */
/* ===== helpers ===== */

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yrs=p=>{const b=(p.born||'').match(/\d{4}/),d=(p.died||'').match(/\d{4}/);return b&&d?`${b[0]}–${d[0]}`:b?`род. ${b[0]}`:d?`† ${d[0]}`:''};
const ini=id=>P[id].gn[0];
const pat=id=>{if(id==='olgi')return 'Ильинична';const w=P[id].nm.split(' ');return w.length>2?w[2]:''};
const fam=id=>id==='olgi'?'':P[id].sn.split(' ')[0];
const gp=id=>P[id].gn+(pat(id)?' '+pat(id):'');
const av=(id,s)=>{const p=P[id];return `<span class="av b-${p.l}${OLD.has(id)?' wk':''}"${s?` style="--s:${s}px"`:''}>${p.photo?`<img src="photos/av2/${({dar:"dar2",mis:"mis2",ale:"ale2"})[id]||id}.jpg" alt="" loading="lazy">`:`<i>${ini(id)}</i>`}</span>`};
const TREEPH=new Set(['iva','dmi','ale','ole','yul','alx','zhen','mis','zoy','vla']);
const avT=id=>TREEPH.has(id)?`<span class="av b-${P[id].l}"><img src="photos/av2/T_${id==="ole"?"ole2":id}.jpg" alt="" loading="lazy"></span>`:av(id);
const short=id=>{const p=P[id];return p.gn+' '+p.sn.split(' ')[0]};
let store={};try{store=JSON.parse(localStorage.getItem('roots2')||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem('roots2',JSON.stringify(store))}catch(e){}};
let VIEWER=store.viewer==='guest'?null:(P[store.viewer]?store.viewer:undefined);
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2400)}
const $=id=>document.getElementById(id);

/* ===== kinship ===== */
const PAR={},KIDS={},SPO={};
FAM.forEach(([par,kids])=>kids.forEach(k=>{PAR[k]=(PAR[k]||[]).concat(par);par.forEach(p=>KIDS[p]=(KIDS[p]||[]).concat(k))}));
COUPLES.forEach(([a,b])=>{SPO[a]=b;SPO[b]=a});
function ups(id){const m={[id]:0},q=[id];while(q.length){const x=q.shift();(PAR[x]||[]).forEach(p=>{if(!(p in m)){m[p]=m[x]+1;q.push(p)}})}return m}
const W=(id,m,f)=>G[id]==='f'?f:m;
function blood(v,t){
  if(v===t)return 'это ты';
  const A=ups(v),B=ups(t);let best=null;
  for(const k in A)if(k in B){const s=A[k]+B[k];if(!best||s<best[0])best=[s,A[k],B[k]]}
  if(!best)return null;const[,a,b]=best;
  if(b===0){return a===1?W(t,'папа','мама'):'пра'.repeat(a-2)+W(t,'дедушка','бабушка')}
  if(b===1&&a>=4)return W(t,'двоюродный ','двоюродная ')+'пра'.repeat(a-3)+W(t,'дедушка','бабушка');
  if(a===0){return b===1?W(t,'сын','дочь'):b===2?W(t,'внук','внучка'):W(t,'правнук','правнучка')}
  const T={'1,1':W(t,'брат','сестра'),'2,1':W(t,'дядя','тётя'),'1,2':W(t,'племянник','племянница'),'2,2':W(t,'двоюродный брат','двоюродная сестра'),
   '3,1':W(t,'двоюродный дедушка','двоюродная бабушка'),'3,2':W(t,'двоюродный дядя','двоюродная тётя'),'3,3':W(t,'троюродный брат','троюродная сестра'),
   '1,3':W(t,'внучатый племянник','внучатая племянница'),'2,3':W(t,'двоюродный племянник','двоюродная племянница'),'4,1':W(t,'двоюродный прадедушка','двоюродная прабабушка'),
   '4,2':W(t,'троюродный дедушка','троюродная бабушка'),'3,4':W(t,'троюродный племянник','троюродная племянница'),'4,3':W(t,'троюродный дядя','троюродная тётя')};
  return T[a+','+b]||'родственник';
}
function gen(id){const n=P[id].gn;if(/й$/.test(n))return n.slice(0,-1)+'я';if(/ия$/.test(n))return n.slice(0,-1)+'и';if(/[кгх]а$/.test(n))return n.slice(0,-1)+'и';if(/я$/.test(n))return n.slice(0,-1)+'и';if(/а$/.test(n))return n.slice(0,-1)+'ы';return n+'а'}
const INLAW={'мама':'муж мамы','папа':'жена папы','дочь':'зять','сын':'невестка','сестра':'зять','брат':'невестка','внучка':'муж внучки','внук':'жена внука','племянница':'муж племянницы','племянник':'жена племянника','тётя':'дядя','дядя':'тётя','двоюродная сестра':'муж двоюродной сестры','двоюродный брат':'жена двоюродного брата'};
function rel1(v,t){const r=blood(v,t);if(r)return r;if(SPO[v]===t)return W(t,'муж','жена');
  const s=SPO[t];if(s){const rs=blood(v,s);if(rs){const m=INLAW[rs];if(m&&!(m==='зять'&&G[t]!=='m')&&!(m==='невестка'&&G[t]!=='f'))return m;return W(t,'муж','жена')+' '+gen(s)}}return null}
function rel(v,t){const r=rel1(v,t);if(r)return r;
  const sv=SPO[v];if(sv){const rs=rel1(sv,t);if(rs){if(['зять','невестка'].includes(rs)||/^(муж|жена) /.test(rs))return W(t,'муж','жена')+' '+gen(SPO[t]);if(rs==='папа'||rs==='мама')return G[v]==='f'?W(t,'свёкор','свекровь'):W(t,'тесть','тёща');return rs+' '+(G[sv]==='m'?'мужа':'жены')}}
  for(const x of Object.keys(P)){const y=SPO[x];if(!y||!blood(v,y)||blood(v,x))continue;let rb=blood(x,t);if(!rb){if(SPO[t]&&blood(x,SPO[t]))return W(t,'муж','жена')+' '+gen(SPO[t]);continue}
    const rx=rel1(v,x);if((rx==='зять'||rx==='невестка')&&(rb==='папа'||rb==='мама'))return W(t,'сват','сватья');return rb+' '+gen(x)}
  return 'родственник'}
const relv=id=>VIEWER?rel(VIEWER,id):'';

/* ===== structure ===== */
const CH=[
 {id:'kuz',t:'Кузьменко из Боромли',hero:'photos/bor-house.jpg',pos:'center 60%',ppl:['prf','nkf','vrm','aln','klv','mrk','dmk','mxm','vas','dmi','vad','pav','ale'],pl:['bor','rov'],intro:'Ветка по фамилии Кузьменко ведёт в казачью Боромлю на Слобожанщине. Отсюда родом Дмитрий Алексеевич, военный врач в пограничных войсках. После войны он с семьёй осел в Саратове.',gal:['bor-house.jpg','bor-katya.jpg','bor-sasha.jpg','bor-tanya.jpg']},
 {id:'vak',t:'Ваккер и Журавлевы',hero:'photos/kuz-unknown.jpg',pos:'center 15%',ppl:['ivv','zhe','olg'],pl:['vak'],intro:'Самая загадочная ветка. Иван Ваккер был немцем. Когда немцев выселяли, его отправили на север, и что с ним стало дальше, семья так и не узнала.'},
 {id:'pet',t:'Петровы с Саратовщины',hero:'photos/vla-mar.jpg',pos:'center 25%',ppl:['ivp','ama','vla','ana','mar','zoy','vvp','svp','kvp'],pl:['sva','bra','nte'],intro:'Сёла на западе Саратовской области, старый Балашовский уезд. Отсюда Зоя Владимировна и её родители: Владимир Иванович, прошедший войну, и Мария Васильевна, в войну работавшая на тракторах.'},
 {id:'iva',t:'Ивановы из Никитовки',hero:'photos/ant-family.jpg',pos:'center 30%',ppl:['olgi','pet','ant','iva','tat','kol','sve','ivn'],pl:['nik'],gal:['old1.jpg','old3.jpg','old4.jpg','old7.jpg','olgi-oven.jpg','olgi-room.jpg','kol-porch.jpg','nik-family2.jpg'],intro:'Деревня Никитовка в Воронежской области, у самой границы с Саратовской. Отсюда родом Александр Петрович Иванов и его сестра Таня.'},
 {id:'now',t:'Наши дни',hero:'photos/family-2025.jpg',pos:'center 35%',ppl:['yul','iva','dar','ole','alx','zhen','mis','kos'],pl:[],intro:'Саратов, дача по выходным, баня в Сторожёвке зимой, подарки на каждый праздник. Поколение, которое продолжает историю.'}
];
const HOME={};CH.forEach(c=>c.ppl.forEach(id=>{if(!HOME[id])HOME[id]=c.id}));
const CHI=Object.fromEntries(CH.map(c=>[c.id,c]));

/* ===== дни рождения, помогите узнать, пути семьи ===== */
const BOT='https://t.me/korni_semyi_bot';
const MEM=id=>!!P[id].died||id==='ale';
function ageW(n){const a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'год':(a>=2&&a<=4&&(b<10||b>=20))?'года':'лет')}
function bdays(days){const now=new Date();now.setHours(0,0,0,0);const out=[];
  for(const id in P){const m=String(P[id].born||'').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);if(!m||(m[1]==='01'&&m[2]==='01'))continue;
    let d=new Date(now.getFullYear(),+m[2]-1,+m[1]);if(d<now)d=new Date(now.getFullYear()+1,+m[2]-1,+m[1]);
    const left=Math.round((d-now)/864e5);out.push({id,d,left,y:+m[3],age:d.getFullYear()-(+m[3])})}
  out.sort((a,b)=>a.left-b.left);const near=out.filter(x=>x.left<=days);return near.length?near:out.slice(0,3)}
function bdBlock(){const L=bdays(31);if(!L.length)return '';
  return `<h2>Скоро дни рождения<small>Кого поздравить в ближайший месяц</small></h2><div class="bdl">${L.map(x=>{const r=relv(x.id);const when=x.left===0?'сегодня':x.left===1?'завтра':`${x.d.getDate()} ${MON[x.d.getMonth()]}`;
    const sub=MEM(x.id)?`${W(x.id,'родился','родилась')} в ${x.y} году`:`${x.left===0?'исполняется':'исполнится'} ${ageW(x.age)}`;
    return `<button class="bdr${x.left===0?' today':''}" data-p="${x.id}"><span class="bdd">${when}</span>${av(x.id,40)}<span><b>${esc(gp(x.id))} ${esc(fam(x.id))}</b><small>${sub}${r?' · '+esc(r):''}</small></span></button>`}).join('')}</div>`}
function helpPage(){const ppl=Object.keys(P).filter(id=>(P[id].ask||[]).length);const n=ppl.reduce((a,id)=>a+P[id].ask.length,0);
  return `<div class="kick">Вопросы</div><h1>Помогите <em>узнать</em></h1><p class="lead">Чего мы пока не знаем о нашей семье. Всего ${n} ${ageW(n).split(' ')[1]==='год'?'вопрос':ageW(n).split(' ')[1]==='года'?'вопроса':'вопросов'}. Если знаете ответ хотя бы на один, расскажите. Проще всего голосом в семейном боте.</p>
  <p><a class="btn" href="${BOT}" target="_blank" rel="noopener">Ответить в боте</a></p>
  ${ppl.map(id=>`<div class="hq"><button class="hqh" data-p="${id}">${av(id,44)}<span><b>${esc(gp(id))} ${esc(fam(id))}</b><small>${esc(relv(id)||P[id].rel||'')}</small></span></button><ul>${P[id].ask.map((a,i)=>`<li><span>${esc(a)}</span><a class="tell" href="${BOT}?start=a_${id}_${i}" target="_blank" rel="noopener">Рассказать</a></li>`).join('')}</ul></div>`).join('')}`}
const JOUR=[
 {who:'dmi',steps:[['bor','1920','родился в Боромле'],['rov','1948','служба, родился Вадим'],['sar','1953','родился Алексей, семья осела в Саратове']]},
 {who:'vla',steps:[['','1924','родился в Ново-Тепловке'],['sim','до 1943','пулемётно-миномётное училище'],['sar','после войны','банк, квартира на Стрелке']]},
 {who:'mar',steps:[['bra','1926','родилась в Братском'],['sar','','с семьёй в Саратове']]},
 {who:'zoy',steps:[['sva','1953','родилась в Святославке'],['sar','','СЭПО, семья, дача']]},
 {who:'iva',steps:[['nik','1972','родился в Никитовке'],['sar','','в Саратове с Юлией']]},
 {who:'tat',steps:[['nik','','выросла в Никитовке'],['uly','','распределили после учёбы']]}];
function journeys(){return `<h2>Как семья двигалась<small>Нажми на место, и глобус покажет его</small></h2><div class="jr">${JOUR.map(j=>`<div class="jc"><button class="jh" data-p="${j.who}">${av(j.who,36)}<b>${esc(gp(j.who))}</b></button><div class="js">${j.steps.map((st,i)=>`${i?'<i class="ja">→</i>':''}<button class="jst"${st[0]?` data-flyto="${st[0]}"`:''}><b>${st[1]||'·'}</b><span>${esc(st[2])}</span></button>`).join('')}</div></div>`).join('')}</div>`}
/* порядок глав под того, кто смотрит */
function myFam(){const v=VIEWER;const par=PAR[v]||[];const sib=[...new Set(par.flatMap(x=>KIDS[x]||[]))].filter(x=>x!==v);const gpar=par.flatMap(x=>PAR[x]||[]);
  const kids=KIDS[v]||[];const gk=kids.flatMap(x=>KIDS[x]||[]);
  const ids=[...new Set([v,SPO[v],...kids,...gk,...par,...sib,...gpar].filter(Boolean))];
  return `<h2>Твоя семья<small>Самые близкие. Нажми, чтобы открыть историю</small></h2><div class="myf">${ids.map(id=>`<button data-p="${id}">${av(id)}<b>${esc(sn(id))}</b><small>${esc(id===v?'это ты':relv(id))}</small></button>`).join('')}</div>`}
function chCards(){const chs=PAGES.filter(p=>p.k==='ch');let last=null,h='';
  chs.forEach(p=>{if(VIEWER&&p.lab!==last){h+=`${last!==null?'</div>':''}<div class="chg">${esc(p.lab)}</div><div class="chc">`;last=p.lab}else if(last===null){h+='<div class="chc">';last=''}
   h+=`<button data-go="${p.s}"><span class="ci"><img src="${p.ch.hero}" alt="" loading="lazy" style="object-position:${p.ch.pos||'center'}"></span><b>${esc(p.ch.t)}</b><small>${p.ch.ppl.length} чел.</small></button>`});
  return `<h2>${VIEWER?'Главы для тебя':'Главы книги'}<small>${VIEWER?'Сначала твои ветки, потом остальные':'Выбери ветку, с которой начать'}</small></h2>${h}</div>`}
function bd(a,b){const ua=ups(a),ub=ups(b);let m=Infinity;for(const k in ua)if(k in ub)m=Math.min(m,ua[k]+ub[k]);return m}
const minD=(v,ids)=>Math.min(...ids.map(id=>bd(v,id)));
function chOrder(){const v=VIEWER;if(!v)return CH.map(c=>({c,lab:''}));const sp=SPO[v];const home=HOME[v];const sw=sp?W(sp,'мужа','жены'):'';
  return CH.map((c,i)=>{let key,lab;
    if(c.id===home){key=0;lab='Твоя ветка'}
    else if(sp&&c.ppl.includes(sp)){key=200;lab='Семья '+sw}
    else{const d=minD(v,c.ppl);if(d<Infinity){key=100+d;lab='Твои родные'}
      else{const ds=sp?minD(sp,c.ppl):Infinity;if(ds<Infinity){key=300+ds;lab='Родня '+sw}else{key=400;lab='Родня через брак'}}}
    return {c,lab,key:key+i/100}}).sort((a,b)=>a.key-b.key)}
const PAGES=[],IDX={};
function buildPages(){PAGES.length=0;PAGES.push({k:'intro',s:'intro',t:'Предисловие'});chOrder().forEach((o,i)=>PAGES.push({k:'ch',s:'ch-'+o.c.id,t:o.c.t,ch:o.c,n:i+1,lab:o.lab}));
  PAGES.push({k:'tree',s:'tree',t:'Семь поколений'},{k:'map',s:'map',t:'Откуда мы'},{k:'time',s:'time',t:'Лента времени'},{k:'arch',s:'arch',t:'Фотоархив'},{k:'kino',s:'kino',t:'Видеоархив'},{k:'help',s:'help',t:'Помогите узнать'},{k:'add',s:'add',t:'Добавить историю'});
  for(const k in IDX)delete IDX[k];PAGES.forEach((p,i)=>IDX[p.s]=i)}
buildPages();
let cur=0;

/* ===== renderers ===== */
const pcard=id=>{const p=P[id];const r=relv(id);return `<button class="pc b-${p.l}${id===VIEWER?' me':''}" data-p="${id}"><div class="ph${OLD.has(id)?' wk':''}">${p.photo?`<img src="${p.photo}" alt="" loading="lazy">`:`<i>${ini(id)}</i>`}<span class="bd"></span></div><b>${esc(gp(id))}${fam(id)?' '+esc(fam(id)):''}</b><small>${p.mn?'урожд. '+esc(p.mn)+(yrs(p)?' · ':''):''}${yrs(p)||(p.mn?'':'&nbsp;')}</small>${r?`<span class="tag${id===VIEWER?' rel':''}">${esc(r)}</span>`:''}</button>`};
const plFacts=k=>{const q=PL[k];return `<div class="card fact"><h3>${esc(q.t)}${q.guess?'<span class="tag ver">версия</span>':''}</h3>${q.f.map(t=>`<p>${esc(cap(t))}</p>`).join('')}${q.src?`<div class="src">${q.src.map(x=>`<a href="${x[1]}" target="_blank" rel="noopener">${esc(x[0])} ↗</a>`).join('')}</div>`:''}</div>`};
const NOMS=[['Алексей Дмитриевич','ale'],['Таня','tat'],['Коля','kol'],['Ольга Ильинична','olgi'],['Ольга Ивановна','olg'],['Дмитрий Алексеевич','dmi'],['Зоя Владимировна','zoy'],['Александр Петрович','iva'],['Владимир Иванович','vla'],['Мария Васильевна','mar'],['Олеся','ole'],['Женя','zhen'],['Миша','mis'],['Александр','iva'],['Саша','iva'],['Юлия','yul'],['Лёша','alx'],['Костя','kos']];
const GENL=[['Зои Владимировны','zoy'],['Алексея Дмитриевича','ale'],['Марии Васильевны','mar'],['Александра Петровича','iva'],['Дмитрия Алексеевича','dmi'],['Владимира Ивановича','vla'],['Ольги Ильиничны','olgi'],['Тани','tat'],['Юлии','yul'],['Александра','iva'],['Олеси','ole'],['Алексея(?! Дмитриевича)','alx']];
const GW={бабушка:'бабушки',дедушка:'дедушки',мама:'мамы',папа:'папы',сестра:'сестры',брат:'брата',тётя:'тёти',дядя:'дяди',прабабушка:'прабабушки',прадедушка:'прадедушки',муж:'мужа',жена:'жены',дочь:'дочери',сын:'сына',внучка:'внучки',внук:'внука',двоюродная:'двоюродной',двоюродный:'двоюродного',правнучка:'правнучки',правнук:'правнука',племянница:'племянницы',племянник:'племянника',зять:'зятя',невестка:'невестки',тёща:'тёщи',тесть:'тестя',свекровь:'свекрови',свёкор:'свёкра'};
const INST=[['Олесей','ole'],['Женей','zhen'],['Мишей','mis'],['Александром','iva'],['Юлией','yul'],['Лёшей','alx']];
const SHORT={kos:'Костя',zhen:'Женя',mis:'Миша',ant:'Тоня',tat:'Таня',sve:'Света',ivn:'Ваня',alx:'Лёша',dar:'Даша',iva:'Саша',yul:'Юля',ole:'Олеся',zoy:'Зоя',ale:'Алексей',olgi:'Ольга Ильинична',olg:'Ольга Ивановна'};
const GSHORT={olgi:'Ольги Ильиничны',olg:'Ольги Ивановны'};
const sn=id=>SHORT[id]||P[id].gn;
function genN(n){if(/й$/.test(n))return n.slice(0,-1)+'я';if(/ия$/.test(n))return n.slice(0,-1)+'и';if(/[кгхшщжч]а$/.test(n))return n.slice(0,-1)+'и';if(/я$/.test(n))return n.slice(0,-1)+'и';if(/а$/.test(n))return n.slice(0,-1)+'ы';return n+'а'}
const needN=(id,r)=>ambig(id)||/^(муж|жена)$/.test(r);
function ambig(id){const r=relv(id);if(!r)return false;let n=0;for(const k in P)if(relv(k)===r)n++;return n>1}
function cap(c){if(c&&c[0]==='~')return c.slice(1);if(!VIEWER)return c;const L='А-Яа-яЁё';const hits=[];
  for(const [n,id] of NOMS){if(!id||id===VIEWER)continue;if(hits.some(h=>h[2]===id))continue;const re=new RegExp('(^|[^'+L+'])'+n+'(?!['+L+'])');const m=c.match(re);if(!m)continue;
    const before=c.slice(0,m.index+m[1].length);if(/(аленькая|аленький|аленькой)\s*$/.test(before))continue;
    let r=relv(id);if(!r||/(мужа|жены)$/.test(r)||/юродн|племянн/.test(r)||/[А-ЯЁ]/.test(r)||r.split(' ').length>2)continue;if(ambig(id)||/^(муж|жена)$/.test(r)){if(!/(дедушка|бабушка|тётя|дядя)$/.test(r))continue;r+=' '+sn(id)}hits.push([n,r,id])}
  const cnt={};hits.forEach(h=>cnt[h[1]]=(cnt[h[1]]||0)+1);let out=c;
  for(const [n,r] of hits){if(c.indexOf(n)<0)continue;if(cnt[r]>1)continue;out=out.replace(new RegExp('(^|[^'+L+'])'+n+'(?: (?:Кузьменко|Петрова?|Иванова?|Архарова?|Мухина?))?(?!['+L+'])'),(m,pre)=>pre+r)}
  if(!GENL.some(([n,id])=>id===VIEWER&&new RegExp('(^|[^'+L+'])'+n+'(?!['+L+'])').test(c))){const gh=[];for(const [n,id] of GENL){if(id===VIEWER||gh.some(h=>h[2]===id))continue;const re=new RegExp('(^|[^'+L+'])'+n+'(?!['+L+'])');if(!re.test(out))continue;const r=relv(id);if(!r||/[А-ЯЁ]/.test(r))continue;const w=r.split(' ');if(w.length>2||!w.every(x=>GW[x]))continue;if(/юродн|племянн/.test(r))continue;if((ambig(id)||/^(муж|жена)$/.test(r))&&!/(дедушка|бабушка|тётя|дядя)$/.test(r))continue;gh.push([n,w.map(x=>GW[x]).join(' ')+(ambig(id)?' '+(GSHORT[id]||genN(sn(id))):''),id])}
   const gc={};gh.forEach(h=>gc[h[1]]=(gc[h[1]]||0)+1);for(const [n,g] of gh){if(gc[g]>1)continue;out=out.replace(new RegExp('(^|[^'+L+'])'+n+'(?: (?:Кузьменко|Петровой|Петрова|Ивановой|Иванова|Мухиной|Мухина))?(?!['+L+'])'),(m,pre)=>pre+g)}}
  for(const [n,id] of INST){if(id!==VIEWER)continue;out=out.replace(new RegExp('(с|со) '+n+'(?!['+L+'])'),'с тобой')}
  out=out.replace(/([.!?]\s+)([а-яё])/g,(m,a,b)=>a+b.toUpperCase());
  return out.charAt(0).toUpperCase()+out.slice(1)}
const PRINT=/^(old\d|kuz-unknown|guitar|vla-|ale-army|ale-portrait|iva-little|yul-young|bor-|olgi-|ole-little|zhen-kid|ole-2006|yul-2006)/;
const gal=(list,big)=>`<div class="gal${big?' big':''}">${list.map(([f,c],i)=>`<button class="print${PRINT.test(f)?' old':''}" style="--rt:${(i%2?1:-1)*(0.6+(i%3)*0.5)}deg" data-lb="photos/${f}" data-cap="${esc(cap(c))}"><img src="photos/${f}" alt="${esc(cap(c))}" loading="lazy"><span>${esc(cap(c))}</span></button>`).join('')}</div>`;
const ARCHM=Object.fromEntries(ARCH);
const LEG=`<div class="legend"><span><span class="dot b-kuz"></span> Кузьменко</span><span><span class="dot b-vak"></span> Ваккер</span><span><span class="dot b-pet"></span> Петровы</span><span><span class="dot b-iva"></span> Ивановы</span><span><span class="dot b-me"></span> наше поколение</span></div>`;
const GENS=[['I','XIX век',['prf']],['II','XIX век',['nkf','vrm']],['III','1890–1900-е',['aln','klv','mrk','dmk','ivv','zhe','ivp','ama']],['IV','1910–20-е',['mxm','dmi','olg','vas','vla','ana','mar','olgi']],['V','1940–50-е',['ale','zoy','vad','vvp','svp','pav','pet','ant']],['VI','1970–80-е',['yul','iva','dar','kvp','tat','kol']],['VII','1990–2010-е',['ole','alx','zhen','mis','kos','sve','ivn']]];
const R={
 intro:()=>`<div class="kick">Предисловие</div><h1>Корни <em>нашей семьи</em></h1>
  <p class="lead">Здесь собрано всё, что удалось узнать о нашей семье: лица, судьбы, сёла, откуда мы родом, и истории, которые рассказывают родные.</p>
  ${VIEWER?'':`<div class="whoi"><b>Кто ты в семье?</b><p>Нажми на себя. Тогда в книге будет подписано, кто тебе кто.</p><div class="row">${VIEWERS.map(id=>`<button data-who="${id}">${av(id)}${esc(P[id].gn)}</button>`).join('')}<button data-whomore="1"><span class="more">+</span>Ещё</button></div></div>`}
  ${VIEWER?myFam():''}${bdBlock()}${chCards()}<button class="hlp" data-go="help"><b>Помогите узнать</b><span>Вопросы, на которые мы пока не знаем ответа</span><i>→</i></button>
  <div class="quote">${cap('Это древо начал собирать Алексей Дмитриевич Кузьменко.')} Он записывал имена, даты и сёла, искал документы в архивах и бережно хранил фотографии. Мы продолжаем его работу.<small>С любовью, семья</small></div>
  <h2>Как читать книгу</h2>
  <div class="how"><div class="card"><div class="n">1</div><b>Листай главы</b><p>Стрелками внизу или свайпом. Глав всего ${PAGES.length}.</p></div>
  <div class="card"><div class="n">2</div><b>Нажми на человека</b><p>Откроется его карточка. Соседей по главе можно листать прямо в ней.</p></div>
  <div class="card"><div class="n">3</div><b>Смотри своими глазами</b><p>${VIEWER?`Сейчас ты смотришь как <b style="display:inline;font:inherit;color:var(--ink)">${esc(P[VIEWER].gn)}</b>. Поменять можно кнопкой наверху справа.`:'Выбери себя кнопкой наверху справа, и мы подпишем, кто тебе кто.'}</p></div></div>
  <h2>Так древо выглядело у дедушки<small>Снимки экрана с его компьютера</small></h2>
  ${gal([['tree-1.jpg','Дедушкино древо'],['tree-2.jpg','Ещё один лист']])}
  <p style="margin-top:34px"><button class="btn" data-go="tree">Начать с пяти поколений →</button></p>`,
 tree:()=>`<div class="kick">Древо</div><h1>Пять <em>поколений</em></h1><p class="lead">Все, кого мы знаем. Сверху самые младшие, ниже их родители, бабушки и дедушки, и так до прапрадедов. Нажми на человека, чтобы открыть его историю.</p>
  ${LEG}
  <div class="gens">${GENS.slice().reverse().map(g=>`<div class="genr"><div class="gn">${g[0]}<small>${g[1]}</small></div><div class="row">${g[2].map(id=>`<button class="mi" data-p="${id}">${av(id)}<b>${esc(P[id].gn)}${pat(id)?`<em>${esc(pat(id))}</em>`:''}${fam(id)?`<em>${esc(fam(id))}</em>`:''}</b><small>${esc(relv(id)||'')}</small></button>`).join('')}</div></div>`).join('')}</div>
  <p style="margin-top:24px"><button class="btn ghost" data-wall="1">Открыть большое древо со связями</button></p>`,
 map:()=>mapPage(),
 time:()=>timePage(),
 ch:pg=>{const c=pg.ch;return `<div class="hero"><div class="hi"><img class="bgb" src="${c.hero}" alt=""><img class="fg" src="${c.hero}" alt=""></div><div class="tx"><div class="kick">${pg.lab?esc(pg.lab)+' · ':''}Глава ${pg.n} из ${CH.length}</div><h1>${esc(c.t)}</h1><p class="lead d">${esc(cap(c.intro))}</p></div></div>
  <p class="lead m">${esc(cap(c.intro))}</p>
  <h2>Люди этой главы<small>Нажми на карточку. Внутри можно листать дальше</small></h2>
  <div class="strip">${c.ppl.map(pcard).join('')}</div>
  ${c.pl.length?`<h2>Места и факты</h2>${c.pl.map(plFacts).join('')}`:''}
  ${c.gal?`<h2>Из архива</h2>${gal(c.gal.map(f=>[f,ARCHM[f]]))}`:''}
  ${c.id==='now'?`<h2>Из семейного кино</h2>${vgrid(VIDS.filter(v=>['zags','ole-steps','ole-school','zhen-6'].includes(v[0])))}<p><button class="btn ghost" data-go="kino">Весь видеоархив →</button></p><h2>Как у нас принято</h2><p>${cap('Каждые выходные дача в Усовке, там у Юлии и Александра много друзей.')} Зимой баня в Сторожёвке. На праздники обязательно подарки.</p><p>На Новый год дети искали под ёлкой подарки от Деда Мороза. Это семейная традиция.</p><p>А ещё раз в какое-то время вся семья садится в машину и едет путешествовать. Были в Карелии, в Питере, на Кавказе, а на море ездили много раз.</p>${gal([["ev-cablecar-2022.jpg","Путешествие на Кавказ"],["ev-blackberry.jpg","На море с бабушкой и родителями"]])}${gal([["ev-tree-2008.jpg","Олеся и Женя ищут подарки от Деда Мороза, 2008"]])}<div class="quote">${cap('Так было и у старших. Алексей Дмитриевич и Зоя Владимировна тоже всё время ездили к друзьям на дачи и в гости, с музыкой и танцами, и брали с собой внучку.')}</div><h2>Из наших альбомов</h2>${gal([['ole-2006.jpg',ARCHM['ole-2006.jpg']],['ole-wedding.jpg',ARCHM['ole-wedding.jpg']],['iva-2025.jpg',ARCHM['iva-2025.jpg']]])}`:''}`},
 kino:()=>`<div class="kick">Архив</div><h1>Видео<em>архив</em></h1><div class="seg"><button data-go="arch">Фото</button><button class="on">Видео</button></div><h2>Дедушкины кассеты</h2><p class="lead">${cap('Алексей Дмитриевич оцифровал семейные видеокассеты.')} Здесь самые памятные моменты из них. Нажми, чтобы посмотреть со звуком.</p>${vgrid(VIDS)}<p style="color:var(--muted);font-size:14px;margin-top:18px">Целиком записи хранятся в дедушкином архиве. Там ещё много часов: дни рождения, Новый год в садике, юбилеи в Боромле.</p>`,
 arch:()=>`<div class="kick">Архив</div><h1>Фото<em>архив</em></h1><div class="seg"><button class="on">Фото</button><button data-go="kino">Видео</button></div><p class="lead">Снимки из дедушкиного архива и из наших телефонов. Нажми, чтобы увеличить. Если узнаёте кого-то на фото с вопросом, расскажите.</p><h2>Праздники и моменты</h2>${gal(EVENTS,1)}<h2>Старые фото и архив</h2>${gal(ARCH,1)}`,
 trad:()=>`<div class="kick">Традиции</div><h1>Как у нас <em>принято</em></h1>
  <p class="lead">Каждые выходные дача в Усовке, там у Юлии и Александра много друзей. Зимой баня в Сторожёвке. На праздники обязательно подарки. Все хорошо общаются.</p>
  ${gal([['dacha-2.jpg','Дача, вся семья вместе']])}
  <div class="quote">${cap('Так было и у старших. Алексей Дмитриевич и Зоя Владимировна тоже всё время ездили к друзьям на дачи и в гости, с музыкой и танцами, и брали с собой внучку.')}</div>
  <h2>Ещё традиции?</h2><p>Если вспомните семейные праздники, блюда, песни или словечки, добавьте их на следующей странице.</p>`,
 help:()=>helpPage(),
 add:()=>addPage()
};

/* ===== person overlay ===== */
let OVL=[],OVI=0,OVC=null;
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function fmtD(d){if(!d)return '';const m=String(d).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(.*)$/);return m?`${+m[1]} ${MON[+m[2]-1]} ${m[3]}${m[4]}`:d}
const yr=t=>{const m=String(t||'').match(/\d{4}/);return m?m[0]:''};
function ptl(id){const p=P[id];const out=[];const by=yr(p.born);const has=(y,re)=>out.some(o=>o[0].startsWith(y)&&(!re||re.test(o[1])));
  if(by)out.push([by,W(id,'Родился','Родилась')+(p.place?' · '+p.place.replace(/^(с|д|г)\. /,''):'')]);
  let lk=by||'0';(p.tl||[]).forEach(t=>{if(by&&t[0]===by&&/родил/i.test(t[1]))return;const k=t[0]||lk;lk=k;out.push([t[0]||'·',t[1],k])});
  EV.filter(e=>e[3]===id).forEach(e=>{if(has(e[0].slice(0,4)))return;if(by&&e[0]===by&&/родил/i.test(e[1]))return;out.push([e[0],cap(e[1])])});
  (KIDS[id]||[]).forEach(k=>{const ky=yr(P[k].born);if(ky&&!has(ky,new RegExp(P[k].gn)))out.push([ky,W(k,'родился сын ','родилась дочь ')+P[k].gn])});
  const dy=yr(p.died);if(dy&&!has(dy,/умер|ушёл|ушла|не стало/i))out.push([dy,W(id,'Умер','Умерла')]);
  return out.map((o,i)=>[o[0],o[1],parseInt(o[2]||o[0])||0,i]).sort((a,b)=>a[2]-b[2]||a[3]-b[3]).map(o=>[o[0],o[1].charAt(0).toUpperCase()+o[1].slice(1)])}
function personHTML(id){const p=P[id];
  const r=relv(id);const him=W(id,'Его','Её');
  const kin=[...new Set([...(PAR[id]||[]),...(SPO[id]?[SPO[id]]:[]),...(KIDS[id]||[]),...((PAR[id]||[]).flatMap(x=>KIDS[x]||[]))])].filter(x=>x!==id);
  const full=gp(id)+(fam(id)?' '+fam(id):'');
  const facts=[["Откуда",p.place],[W(id,'Родился','Родилась'),fmtD(p.born)],["Годы жизни",p.died?yrs(p):''],["Урождённая",p.mn]].filter(f=>f[1]).map(f=>`<div><small>${f[0]}</small><span>${esc(f[1])}</span></div>`).join('')+(r?`<div><small>Тебе</small><span class="tag rel">${esc(id===VIEWER?'это ты':r)}</span></div>`:'');
  const hero=p.photo?`<button class="phero${OLD.has(id)?' wk':''}" data-lb="${p.photo}" data-cap="${esc(CAP[id]||full)}"><img src="${p.photo}" alt="${esc(full)}"><div class="pht"><h1>${esc(full)}</h1>${p.rel?`<p>${esc(p.rel)}</p>`:''}</div></button>`:`<div class="phero noimg"><i>${ini(id)}</i><div class="pht"><h1>${esc(full)}</h1>${p.rel?`<p>${esc(p.rel)}</p>`:''}</div></div>`;
  const tl=ptl(id);const vids=VIDS.filter(v=>v[3].includes(id));
  return `${hero}<div class="psheet"><div class="pf">${facts}</div>
   ${id==='ale'?`<h2>Голос</h2><button class="player" data-vid="zoy-55" data-cap="Юбилей Зои Владимировны. Алексей Дмитриевич с микрофоном"><div class="pl"><svg width="18" height="18" viewBox="0 0 24 24" fill="#141414"><path d="M8 5v14l11-7z"/></svg></div><p>Алексей Дмитриевич говорит тост на юбилее Зои Владимировны, 2008</p></button>`:''}
   <h2>${him} история${p.guess?'<span class="tag ver">есть версии</span>':''}</h2><div class="bio">${(p.bio||['Пока мы знаем об этом человеке только имя. Может быть, вы знаете больше?']).map(t=>`<p>${esc(t)}</p>`).join('')}</div>
   ${tl.length>1?`<h2>Хронология</h2><ul class="ptl">${tl.map(t=>`<li><b>${esc(t[0])}</b><span>${esc(t[1])}</span></li>`).join('')}</ul>`:''}
   ${GAL[id]?`<h2>Фотографии</h2>${gal(GAL[id])}`:''}
   ${vids.length?`<h2>Видео</h2>${vgrid(vids)}`:''}
   ${(PMAP[id]||[]).filter(k=>!(CHI[HOME[id]].pl||[]).includes(k)).map(k=>`<h2>Место</h2>${plFacts(k)}`).join('')}
   ${p.stories?`<h2>Воспоминания</h2>${p.stories.map(st=>`<div class="story">${esc(st[0])}<small>${esc(st[1])}</small></div>`).join('')}`:''}
   <h2>Что ещё узнать</h2><div class="ask"><b>${p.stories?'Расскажите ещё':'Историй пока нет'}</b>${p.ask?`<ul>${p.ask.map((a,i)=>`<li><span>${esc(a)}</span><a class="tell" href="${BOT}?start=a_${id}_${i}" target="_blank" rel="noopener">Рассказать</a></li>`).join('')}</ul>`:'<br>'}<a class="btn" href="${BOT}?start=s_${id}" target="_blank" rel="noopener">Рассказать о ${esc(W(id,'нём','ней'))} в боте</a> <a data-go="add">или написать здесь →</a></div>
   ${kin.length?`<h2>Родные</h2><div class="chips">${kin.map(k=>`<button class="chip" data-p="${k}">${av(k,26)}${esc(short(k))}${relv(k)?` <em>${esc(relv(k))}</em>`:''}</button>`).join('')}</div>`:''}
   ${p.arch?`<h2>Архивные документы</h2><div class="arch">${p.arch.map(x=>`<a href="${x[2]}" target="_blank" rel="noopener"><b>${esc(x[0])}</b><small>${esc(x[1])}</small><em>Скан на FamilySearch ↗</em></a>`).join('')}</div>`:''}
   ${p.src?`<h2>Источники</h2><div class="src">${p.src.map(x=>`<a href="${x[1]}" target="_blank" rel="noopener">${esc(x[0])} ↗</a>`).join('')}</div>`:''}
   <div class="swipeh">← листай людей главы стрелками сверху →</div></div>`}
function openP(id,dir){
  const ch=OVC&&CHI[OVC].ppl.includes(id)?OVC:HOME[id];OVC=ch;OVL=CHI[ch].ppl;OVI=OVL.indexOf(id);
  const b=$('ovb');b.innerHTML=personHTML(id);b.scrollTop=0;b.classList.remove('in-r','in-l');if(dir){void b.offsetWidth;b.classList.add(dir>0?'in-r':'in-l')}
  $('ovT').textContent=`${CHI[ch].t} · ${OVI+1} из ${OVL.length}`;$('ovPrev').disabled=OVI<=0;$('ovNext').disabled=OVI>=OVL.length-1;
  if(!$('ov').classList.contains('on'))history.pushState({layer:'ov'},'',location.href);
  $('ov').classList.add('on');document.body.style.overflow='hidden';wake(b);
  if(location.hash!=='#p-'+id)history.replaceState(null,'','#p-'+id)}
function closeP(pop){if(!pop&&history.state&&history.state.layer==='ov'){history.back();return}$('ov').classList.remove('on');OVC=null;if(!$('wall').classList.contains('hide'))return;document.body.style.overflow='';if(!pop)history.replaceState(null,'','#'+PAGES[cur].s)}
$('ovX').onclick=closeP;$('ov').addEventListener('click',e=>{if(e.target.id==='ov')closeP()});
$('ovPrev').onclick=()=>OVI>0&&openP(OVL[OVI-1],-1);$('ovNext').onclick=()=>OVI<OVL.length-1&&openP(OVL[OVI+1],1);
{let x0=null,y0=null;const b=$('ovb');b.addEventListener('touchstart',e=>{if(e.target.closest('.gal,input,textarea'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
 b.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>70&&Math.abs(dy)<60)(dx<0?$('ovNext'):$('ovPrev')).click()},{passive:true})}

/* ===== map ===== */
const PTS=[
 {k:'rov',n:'Ровно',lat:50.62,lon:26.25,w:'Здесь в 1948 году родился Вадим, сын Дмитрия Алексеевича',who:['vad']},
 {k:'bor',n:'Боромля',lat:50.63,lon:34.97,w:'Казачье село, родина Кузьменко',who:['nkf','aln','dmk','mxm','vas','dmi','pav']},
 {k:'nik',n:'Никитовка',lat:51.68,lon:41.63,w:'Родина Александра Петровича и Татьяны. Здесь жила Ольга Ильинична и живёт Антонина. Рядом течёт речка Мокрый Карачан',who:['ant','olgi','iva','tat']},
 {k:'bra',n:'Братское',lat:51.55,lon:43.17,w:'Родина Марии Васильевны (место примерное)',who:['mar']},
 {k:'sva',n:'Святославка',lat:51.33,lon:43.43,w:'Родина Зои Владимировны',who:['zoy']},
 {k:'vak',n:'колонии Поволжья',lat:51.2,lon:45.55,w:'Версия: отсюда могла быть фамилия Ваккер',who:['olg'],guess:1},
 {k:'uly',n:'Ульяновск',lat:54.32,lon:48.40,w:'Здесь живёт семья Татьяны и Николая Мухиных',who:['tat','kol','sve','ivn']},
 {k:'mon',n:'Монино',lat:55.84,lon:38.19,w:'Отсюда в 1952 году брат Анатолий прислал фото Володе и Марусе',who:['ana','vla','mar']},
 {k:'sim',n:'Симферополь',lat:44.95,lon:34.10,w:'Здесь Владимир Иванович окончил пулемётно-миномётное училище',who:['vla']},
 {k:'sar',n:'Саратов',lat:51.53,lon:46.03,w:'Здесь живёт семья. Здесь работал СЭПО, где трудились Алексей и Зоя',who:['ale','zoy','yul','dar','ole','zhen','mis','kos'],big:1}
];
const prj=(lat,lon)=>[Math.max(34,30+(lon-33.4)/(47.2-33.4)*540),345-(lat-50.3)/(52.0-50.3)*290];
function mapPage(){
  return `<div class="kick">Карта</div><h1>Откуда <em>мы</em></h1><p class="lead">Сёла и города, где родились и жили наши родные. Покрути глобус пальцем или мышкой, приближай двумя пальцами или колесом. Нажми на точку, чтобы узнать, кто оттуда.</p>
  <div class="globe" id="globe"><svg id="gsv"></svg><div id="gpins"></div>
   <div class="gbtn"><button data-fly="world">Весь мир</button><button data-fly="home" class="on">Наш край</button></div>
   <div class="gload" id="gload">Загружаю карту…</div></div>
  <p style="font-size:13px;color:var(--muted);margin-top:8px">Пунктир показывает, как семья собиралась в Саратове и куда разъезжалась. Ново-Тепловку пока не нашли.</p>
  ${journeys()}
  <div class="places">${PTS.map(p=>`<div class="card place" id="pl-${p.k}"><h3>${p.n}${p.guess?'<span class="tag ver">версия</span>':''}</h3><p>${esc(p.w)}</p><div class="chips">${p.who.map(id=>`<button class="chip" data-p="${id}">${av(id,26)}${esc(gp(id))}</button>`).join('')}</div><button class="flyto" data-flyto="${p.k}">Показать на карте →</button></div>`).join('')}</div>`}
const ROUTES=[['rov','bor'],['bor','sar'],['nik','sar'],['sva','sar'],['bra','sar'],['nik','uly'],['sim','sar']];
let GL=null;const MINOR=new Set(['bra','sva','vak']);
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
let WORLDP=null;
function getWorld(){return WORLDP||(WORLDP=fetch('data/world.json').then(r=>r.json()))}
async function initGlobe(){
  const box=$('globe');if(!box)return;
  try{if(!window.d3)await loadScript('js/d3.min.js');if(!window.topojson)await loadScript('js/topojson.min.js')}catch(e){$('gload').textContent='Карта не загрузилась. Проверь интернет.';return}
  if(!$('globe'))return;$('gload').remove();
  const W=box.clientWidth,H=box.clientHeight;const svg=d3.select('#gsv').attr('viewBox',`0 0 ${W} ${H}`);
  const WORLD=await getWorld();const land=topojson.feature(WORLD,WORLD.objects.countries);const fam=new Set(['643','804']);
  const base=Math.min(W,H)/2*0.92;
  const proj=d3.geoOrthographic().translate([W/2,H/2]).clipAngle(90).precision(.4);const path=d3.geoPath(proj);
  const st={rot:[-20,-35,0],k:1};
  const sph=svg.append('path').datum({type:'Sphere'}).attr('class','g-sea');
  const grat=svg.append('path').datum(d3.geoGraticule10()).attr('class','g-grat');
  const cs=svg.append('g').selectAll('path').data(land.features).join('path').attr('class',d=>'g-land'+(fam.has(String(d.id))?' fam':''));
  const rt=svg.append('g').selectAll('path').data(ROUTES).join('path').attr('class','g-route');
  const pins=d3.select('#gpins');const PM=Object.fromEntries(PTS.map(p=>[p.k,p]));
  const pe=pins.selectAll('div').data(PTS).join('div').attr('class',d=>'gpin'+(d.k==='nik'||d.k==='mon'?' left':'')+(d.big?' big':'')+(d.guess?' guess':'')).attr('data-pt',d=>d.k)
   .html(d=>`<i>${av(d.who.find(x=>P[x].photo)||d.who[0],40)}</i><span class="gl">${d.n}</span><span class="ga">${d.who.slice(0,3).map(id=>av(id,22)).join('')}</span>`);
  function draw(){proj.rotate(st.rot).scale(base*st.k);sph.attr('d',path);grat.attr('d',path);cs.attr('d',path);
    rt.attr('d',r=>path({type:'LineString',coordinates:[[PM[r[0]].lon,PM[r[0]].lat],[PM[r[1]].lon,PM[r[1]].lat]]}));
    const c=[-st.rot[0],-st.rot[1]];
    pe.each(function(d){const vis=d3.geoDistance([d.lon,d.lat],c)<Math.PI/2-.02;const [x,y]=proj([d.lon,d.lat]);this.style.display=vis?'':'none';this.style.transform=`translate(${x}px,${y}px)`;this.classList.toggle('small',st.k<3&&!d.big);this.classList.toggle('mini',st.k<11&&MINOR.has(d.k))})}
  draw();
  let lt=null;const zoom=d3.zoom().scaleExtent([.7,28]).on('start',e=>{lt=e.transform}).on('zoom',e=>{const t=e.transform;if(lt&&Math.abs(t.k-lt.k)<1e-6){const f=180/Math.PI/(base*st.k);st.rot[0]+=(t.x-lt.x)*f;st.rot[1]=Math.max(-85,Math.min(85,st.rot[1]-(t.y-lt.y)*f))}st.k=t.k;lt=t;draw()});
  svg.call(zoom).on('dblclick.zoom',null);
  function fly(rot,k,ms=1400){const r0=st.rot.slice(),k0=st.k;const ir=d3.interpolate(r0,rot),ik=d3.interpolate(k0,k);const t=d3.timer(el=>{const u=Math.min(1,el/ms),e=d3.easeCubicInOut(u);st.rot=ir(e);st.k=ik(e);draw();if(u>=1){t.stop();svg.call(zoom.transform,d3.zoomIdentity.scale(st.k))}})}
  GL={fly,PM};
  setTimeout(()=>fly([-40,-51.5,0],W<600?5.2:6.5,2200),500);
}
function glFly(k){if(!GL)return;document.querySelectorAll('.gbtn button').forEach(b=>b.classList.toggle('on',b.dataset.fly===k));
  if(k==='world')GL.fly([-40,-35,0],1);else if(k==='home')GL.fly([-40,-51.5,0],innerWidth<600?5.2:6.5);else{const p=GL.PM[k];GL.fly([-p.lon,-p.lat,0],14);$('globe').scrollIntoView({behavior:'smooth',block:'center'})}}

/* ===== timeline ===== */
const EV=[
 ['1658','Основана Боромля: атаман Корней Васильев с 425 казаками','h'],
 ['1711','Украинские переселенцы основали Красавку, по соседству со Святославкой','h'],
 ['1767','Семья Ваккер поселилась в колонии Прейс на Волге (версия о корнях)','h'],
 ['1897','Открыто рисовальное училище Боголюбова. Потом в нём будет учиться Женя','h'],
 ['1891','В Сумах, по метрикам, родился Алексей Никифорович Кузьменко','f','aln'],
 ['1893','В Сумах родилась Мария, сестра Алексея Никифоровича','f','mrk'],
 ['1904','Семья Никифора Кузьменко уже живёт в Боромле, здесь родился его сын Димитрий','f','dmk'],
 ['1916','В Боромле умер Димитрий, сын Никифора, 14 лет. Возможно, брат Алексея','f','dmk'],
 ['1918','Алексей Никифорович женится, вероятно, на Клавдии Николаевне Лупейкиной','f','klv'],
 ['1919','В Боромле родился Максим, сын Алексея Никифоровича. Он прожил всего пять месяцев','f','mxm'],
 ['1920','В Боромле родился Дмитрий Алексеевич Кузьменко','f','dmi'],
 ['1924','В Ново-Тепловке родился Владимир Иванович Петров','f','vla'],
 ['1926','В селе Братское родилась Мария Васильевна Петрова','f','mar'],
 ['1939','В Саратове основан завод СЭПО','h'],
 ['1940','Дмитрий Алексеевич Кузьменко уходит в армию','f','dmi'],
 ['1941–45','Война. Дмитрий Алексеевич Кузьменко на фронте','f','dmi'],
 ['1941–45','Мария Васильевна в войну, совсем девчонкой, работает на тракторах','f','mar'],
 ['1943','Владимир Иванович Петров уходит на фронт','f','vla'],
 ['1944','Владимир Иванович ранен. До конца войны он лечится в госпитале','f','vla'],
 ['1948','В Ровно у Дмитрия Алексеевича родился сын Вадим','f','vad'],
 ['1951','СЭПО выпускает первые холодильники «Саратов»','h'],
 ['1952','Анатолий Иванович Петров присылает брату Володе и его жене Марусе фото из Монино','f','ana'],
 ['1952','В Боромле родился Павел Васильевич Кузьменко','f','pav'],
 ['1953','Родились Алексей Дмитриевич Кузьменко и Зоя Владимировна Петрова. Через много лет они станут мужем и женой','f','ale'],
 ['1956','Дмитрий Алексеевич уходит со службы','f','dmi'],
 ['1961','Дмитрий Алексеевич Кузьменко получает диплом инженера-электрика','f','dmi'],
 ['1972','В Никитовке родился Александр Петрович Иванов','f','iva'],
 ['1975','Родилась Юлия, дочь Алексея Дмитриевича и Зои Владимировны','f','yul'],
 ['1983','Алексей Дмитриевич окончил Саратовский политехнический институт','f','ale'],
 ['1984','Родилась Дарья, младшая дочь Алексея Дмитриевича и Зои Владимировны','f','dar'],
 ['1979','Алексей Дмитриевич получает звание «Донор СССР»','f','ale'],
 ['1985','Дмитрий Алексеевич награждён орденом Отечественной войны II степени','f','dmi'],
 ['1997','Родилась Олеся','f','ole'],
 ['2006','Родились Женя и Костя','f','zhen'],
 ['2014','Родился Миша','f','mis'],
 ['2019','Вся семья едет в Крым: Ай-Петри и Ласточкино гнездо','f','zoy'],
 ['2016','Олеся познакомилась с Лёшей Архаровым','f','ole'],
 ['2021','Свадьба Олеси и Лёши, 5 июня','f','alx'],
 ['2023','Алексей Дмитриевич отмечает 70 лет на даче','f','ale'],
 ['2026','Женя окончила училище Боголюбова. А семья продолжает древо Алексея Дмитриевича','f','zhen']
];
let tlMode=store.tl||'all';
function decs(list){const out=[];let last='';list.forEach(e=>{const y=parseInt(e[0]);const d=y<1900?'Давно':y<1940?'Начало XX века':Math.floor(y/10)*10+'-е';if(d!==last){out.push({dec:d});last=d}out.push(e)});return out}
function lifeChart(){const ppl=Object.keys(P).filter(id=>yr(P[id].born));const dec=y=>Math.floor(y/10)*10;
  const born={},died={};ppl.forEach(id=>{const b=+yr(P[id].born);(born[dec(b)]=born[dec(b)]||[]).push(id);const d=+yr(P[id].died);if(d)(died[dec(d)]=died[dec(d)]||[]).push(id)});
  const ds=[...new Set([...Object.keys(born),...Object.keys(died)].map(Number))].sort((a,b)=>a-b);
  const card=(id,kind)=>{const p=P[id];const b=+yr(p.born),d=+yr(p.died);const age=d?d-b:0;const r=relv(id);
    const line=kind==='b'?(d?`${b}–${d}, ${W(id,'прожил','прожила')} ${age} ${age%10===1&&age%100!==11?'год':(age%10>=2&&age%10<=4&&(age%100<10||age%100>=20))?'года':'лет'}`:`${W(id,'родился','родилась')} в ${b}`):`${W(id,'умер','умерла')} в ${d}`;
    return `<button class="dzc" data-p="${id}">${av(id,44)}<span><b>${esc(gp(id))}</b><small>${line}${r?' · '+esc(r):''}</small></span></button>`};
  return ds.map(d=>{const bs=(born[d]||[]).sort((a,b)=>yr(P[a].born)-yr(P[b].born)),dd=(died[d]||[]).sort((a,b)=>yr(P[a].died)-yr(P[b].died));
    return `<section class="dz"><div class="dzy">${d}-е</div>${bs.length?`<div class="dzl">${bs.length>1?'Родились':W(bs[0],'Родился','Родилась')}</div><div class="dzr">${bs.map(id=>card(id,'b')).join('')}</div>`:''}${dd.length?`<div class="dzl">Ушли из жизни</div><div class="dzr">${dd.map(id=>card(id,'d')).join('')}</div>`:''}</section>`}).join('')}
function timePage(){return `<div class="kick">Лента времени</div><h1>От казаков <em>до наших дней</em></h1>
  <h2>Кто когда жил<small>По десятилетиям: кто родился и кто ушёл</small></h2>${lifeChart()}<h2>Год за годом</h2>
  <div class="seg"><button data-tl="all" class="${tlMode==='all'?'on':''}">Всё</button><button data-tl="f" class="${tlMode==='f'?'on':''}">Только семья</button></div>
  <ul class="line">${decs(EV.filter(e=>tlMode==='all'||e[2]==='f').slice().sort((a,b)=>parseInt(a[0])-parseInt(b[0]))).map(e=>e.dec?`<li class="dec"><span>${e.dec}</span></li>`:`<li class="${e[2]==='f'?'fam':'hist'}"><span class="y">${e[0]}</span><span class="e">${e[3]?`<button data-p="${e[3]}">${av(e[3],34)}<u>${esc(cap(e[1]))}</u></button>`:`<span style="color:var(--muted)">${esc(e[1])}</span>`}</span></li>`).join('')}</ul>`}

/* ===== add story ===== */
function addPage(){return `<div class="kick">Ваши истории</div><h1>Добавить <em>историю</em></h1>
  <p class="lead">Напишите воспоминание о ком-то из родных. Как он смеялся, что говорил, какой случай запомнился. Мелочей тут нет.</p>
  <div class="card form" id="form">
   <label for="fWho">О ком</label><select id="fWho">${['ale','zoy','yul','iva','ant','dar','tat','kol','ole','alx','zhen','mis','kos','sve','ivn','vla','mar','dmi','olg','pet','olgi','vad','pav','vas','ana','ivp','zhe','ivv','aln','vvp','kvp','svp'].filter(id=>P[id]).map(id=>`<option value="${id}">${esc(P[id].nm)}</option>`).join('')}</select>
   <label for="fBy">Кто рассказывает</label><input id="fBy" placeholder="Например: Юлия, дочь" value="${VIEWER?esc(P[VIEWER].gn):''}">
   <label for="fTxt">История</label><textarea id="fTxt" placeholder="Однажды..."></textarea>
   <div class="err" id="fErr"></div>
   <div class="sendrow"><a class="btn" id="fBot" href="#" target="_blank" rel="noopener">Отправить в семейный бот</a><a class="btn ghost" id="fWa" href="#" target="_blank" rel="noopener">WhatsApp</a><button class="btn ghost" id="fSend">Скопировать</button></div>
   <p style="font-size:14px;color:var(--muted);margin:10px 0 0">Текст скопируется сам. Откроется семейный бот: нажмите «Старт», если нужно, и вставьте текст в сообщение. Можно и просто рассказать голосом.</p>
   <div class="ok" id="fOk"></div>
  </div>
  <h2>Как ещё помочь</h2>
  <ol class="steps"><li><b>Сканируйте фото</b> в приложении Google PhotoScan. Оно убирает блики. Сканируйте и обратную сторону с подписями.</li>
  <li><b>Подпишите</b>, кто на фото, где и примерно когда.</li><li><b>Рассказывайте голосом:</b> так проще всего. <a href="https://t.me/arkharovaoa" target="_blank" rel="noopener" style="color:var(--acc)">Написать Олесе в Telegram</a> (@arkharovaoa) и записать голосовое.</li>
  <li><b>Ищите документы:</b> военные билеты, трудовые книжки, дипломы, награды, письма.</li></ol>`}

/* ===== navigation ===== */
const pgEl=$('pg');
function render(dir){
  const pg=PAGES[cur];
  pgEl.innerHTML=R[pg.k](pg);GL=null;if(pg.k==='map')requestAnimationFrame(initGlobe);
  pgEl.classList.remove('in-r','in-l');if(dir){void pgEl.offsetWidth;pgEl.classList.add(dir>0?'in-r':'in-l')}
  const pv=PAGES[cur-1],nx=PAGES[cur+1];$('prev').disabled=!pv;$('next').disabled=!nx;
  $('prev').querySelector('.pt').textContent=pv?pv.t:'Начало';$('next').querySelector('.pt').textContent=nx?nx.t:'Конец';
  $('cnt').textContent=`${cur+1} / ${PAGES.length}`;$('progI').style.width=((cur+1)/PAGES.length*100)+'%';
  const nxp=PAGES[cur+1],pvp=PAGES[cur-1];pgEl.insertAdjacentHTML('beforeend',`<nav class="endnav">${nxp?`<button class="nx" data-go="${nxp.s}"><span><small>Дальше</small><b>${esc(nxp.t)}</b></span><i>→</i></button>`:`<button class="nx" data-go="intro"><span><small>Это конец книги</small><b>Вернуться в начало</b></span><i>↑</i></button>`}${pvp?`<button class="pv" data-go="${pvp.s}">← ${esc(pvp.t)}</button>`:''}</nav>`);
  setTab();window.scrollTo({top:0});wake(pgEl);
  if(!$('ov').classList.contains('on')&&location.hash!=='#'+pg.s)history.replaceState(null,'','#'+pg.s)}
function go(s,dir){const i=IDX[s];if(i===undefined)return;if(location.hash!=='#'+s&&!$('ov').classList.contains('on'))history.pushState(null,'','#'+s);const d=dir!==undefined?dir:(i>cur?1:i<cur?-1:0);cur=i;render(d)}
$('prev').onclick=()=>cur>0&&go(PAGES[cur-1].s,-1);$('next').onclick=()=>cur<PAGES.length-1&&go(PAGES[cur+1].s,1);
$('btnWall').onclick=()=>openWall();
function openChs(){let last=null;$('chl').innerHTML=`<input id="psrch" type="search" placeholder="Найти человека по имени" autocomplete="off"><div id="psres"></div>`+PAGES.map((p,i)=>{let hd='';const g=p.ch?(p.lab||'Главы'):'Книга';if(g!==last&&(VIEWER||i<2||!p.ch)){hd=`<div class="chlh">${esc(g)}</div>`;last=g}return hd+`<button data-go="${p.s}" class="${i===cur?'on':''}"><i>${i+1}</i>${esc(p.t)}${p.ch?`<small>${p.ch.ppl.length} чел.</small>`:''}</button>`}).join('');$('chs').classList.add('on')}
$('btnCh').onclick=openChs;
document.addEventListener('input',e=>{if(e.target.id!=='psrch')return;const q=e.target.value.trim().toLowerCase();const r=$('psres');if(q.length<2){r.innerHTML='';return}
  const hits=Object.keys(P).filter(id=>(P[id].nm+' '+(P[id].mn||'')+' '+(SHORT[id]||'')).toLowerCase().includes(q)).slice(0,8);
  r.innerHTML=hits.length?hits.map(id=>`<button data-p="${id}">${av(id,28)}<span>${esc(gp(id))} ${esc(fam(id))}${relv(id)?` <small>${esc(relv(id))}</small>`:''}</span></button>`).join(''):'<div class="psno">Никого не нашли</div>'});$('chs').addEventListener('click',e=>{if(e.target.id==='chs')$('chs').classList.remove('on')});
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  if(e.key==='Escape'){if($('lb').classList.contains('on'))return closeLb();if($('ov').classList.contains('on'))return closeP();if(!$('wall').classList.contains('hide'))return closeWall();$('chs').classList.remove('on');return}
  if(!$('wall').classList.contains('hide')||$('lb').classList.contains('on'))return;
  if($('ov').classList.contains('on')){if(e.key==='ArrowRight')$('ovNext').click();if(e.key==='ArrowLeft')$('ovPrev').click();return}
  if(e.key==='ArrowRight')$('next').click();if(e.key==='ArrowLeft')$('prev').click()});
{let sx0=null,sy0=null;const book=$('book');
book.addEventListener('touchstart',e=>{if(e.target.closest('.globe,.map,textarea,input,select,.strip,.gal'))return;sx0=e.touches[0].clientX;sy0=e.touches[0].clientY},{passive:true});
book.addEventListener('touchend',e=>{if(sx0===null)return;const dx=e.changedTouches[0].clientX-sx0,dy=e.changedTouches[0].clientY-sy0;sx0=null;if(Math.abs(dx)>70&&Math.abs(dy)<60){dx<0?$('next').click():$('prev').click()}},{passive:true})}
document.addEventListener('click',e=>{
  const vd=e.target.closest('[data-vid]');if(vd){openLb('video/'+vd.dataset.vid+'.mp4',vd.dataset.cap,1);return}
  const lb=e.target.closest('[data-lb]');if(lb){openLb(lb.dataset.lb,lb.dataset.cap);return}
  const pp=e.target.closest('[data-p]');if(pp&&!e.target.closest('#world')){$('chs').classList.remove('on');const id=pp.dataset.p;const inOv=!!e.target.closest('#ov');if(inOv&&!CHI[OVC].ppl.includes(id))OVC=null;openP(id,inOv?1:0);return}
  const g=e.target.closest('[data-go]');if(g){e.preventDefault();$('chs').classList.remove('on');if($('ov').classList.contains('on'))closeP(true);closeWall(true);go(g.dataset.go);return}
  if(e.target.closest('[data-wall]')){openWall();return}
  const tb=e.target.closest('[data-tl]');if(tb){tlMode=tb.dataset.tl;store.tl=tlMode;save();render(0);return}
  const fb=e.target.closest('[data-fly]');if(fb){glFly(fb.dataset.fly);return}
  const ft=e.target.closest('[data-flyto]');if(ft){glFly(ft.dataset.flyto);if(ft.classList.contains('jst')&&$('globe'))$('globe').scrollIntoView({behavior:'smooth',block:'center'});return}
  const pt=e.target.closest('[data-pt]');if(pt){document.querySelectorAll('.place').forEach(x=>x.classList.remove('hl'));const el=$('pl-'+pt.dataset.pt);el.classList.add('hl');el.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(e.target.id==='fSend')sendStory();
});

function storyMsg(){const who=$('fWho').value,by=$('fBy').value.trim(),txt=$('fTxt').value.trim();return {ok:by&&txt.length>=10,by,txt,msg:`История для семейной книги\nО ком: ${P[who].nm}\nРассказывает: ${by}\n\n${txt}`}}
document.addEventListener('click',e=>{const a=e.target.closest('#fBot,#fWa');if(!a)return;const m=storyMsg();$('fErr').textContent='';
  if(!m.by){e.preventDefault();$('fErr').textContent='Напишите, кто рассказывает';$('fBy').focus();return}
  if(m.txt.length<10){e.preventDefault();$('fErr').textContent='Напишите саму историю, хотя бы пару предложений';$('fTxt').focus();return}
  if(a.id==='fBot'){try{navigator.clipboard.writeText(m.msg)}catch(_){}a.href=BOT+'?start=s_'+$('fWho').value}else a.href='https://wa.me/?text='+encodeURIComponent(m.msg);
  $('fOk').textContent='Спасибо! Олеся добавит историю в книгу.'},true);
function sendStory(){const who=$('fWho').value,by=$('fBy').value.trim(),txt=$('fTxt').value.trim();$('fErr').textContent='';$('fOk').textContent='';
  if(!by){$('fErr').textContent='Напишите, кто рассказывает';$('fBy').focus();return}
  if(txt.length<10){$('fErr').textContent='Напишите саму историю, хотя бы пару предложений';$('fTxt').focus();return}
  const msg=`История для семейной книги\nО ком: ${P[who].nm}\nРассказывает: ${by}\n\n${txt}`;
  const ok=()=>{$('fOk').textContent='Скопировано! Вставьте это в сообщение Олесе, и она добавит историю в книгу.'};
  if(navigator.clipboard)navigator.clipboard.writeText(msg).then(ok,()=>{$('fTxt').select();$('fOk').textContent='Не получилось скопировать автоматически. Выделите текст и скопируйте его вручную.'});else{$('fTxt').select();$('fOk').textContent='Выделите текст и скопируйте его вручную.'}}
document.addEventListener('input',e=>{if(e.target.id==='fBy'||e.target.id==='fTxt')$('fErr').textContent=''});

/* lightbox */
function openLb(src,cap,vid){if(!$('lb').classList.contains('on'))history.pushState({layer:'lb'},'',location.href);const I=$('lbI'),V=$('lbV');I.classList.toggle('hide',!!vid);V.classList.toggle('hide',!vid);if(vid){V.poster=src.replace('.mp4','.jpg');V.src=src;V.play().catch(()=>{})}else I.src=src;$('lbP').textContent=cap||'';$('lb').classList.add('on')}
function closeLb(pop){if(!pop&&history.state&&history.state.layer==='lb'){history.back();return}$('lb').classList.remove('on');const V=$('lbV');V.pause();V.removeAttribute('src');V.load()}
$('lb').addEventListener('click',e=>{if(e.target.id!=='lbI'&&e.target.id!=='lbV')closeLb()});

/* old photos come alive */
function wake(root){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const t=en.target;setTimeout(()=>t.classList.add('alive'),600);io.unobserve(t)}}),{threshold:.5});
  root.querySelectorAll('.wk').forEach(f=>io.observe(f))}

/* ===== viewer ===== */
const VIEWERS=['ole','alx','yul','iva','zhen','mis','zoy','dar','kos'];
const VIEWERS2=['ant','tat','kol','sve','ivn','vvp','svp','kvp','pav'];
function drawMe(){$('btnMe').innerHTML=VIEWER?`${av(VIEWER,30)}<span>Я — ${esc(P[VIEWER].gn)}</span>`:`<span class="av" style="--s:30px;--b:#ccc;box-shadow:none"><i>?</i></span><span>Кто я?</span>`}
const wpb=id=>`<button class="wp${id===VIEWER?' on':''}" data-who="${id}">${av(id)}<b>${esc(P[id].gn)}</b><small>${esc(P[id].sn.split(' ')[0])}</small></button>`;
function openWho(){$('wg').innerHTML=VIEWERS.map(wpb).join('');$('wg2').innerHTML=VIEWERS2.filter(id=>P[id]).map(wpb).join('');const open=VIEWERS2.includes(VIEWER);$('wg2').classList.toggle('hide',!open);$('wmore').classList.toggle('hide',open);$('who').classList.remove('hide')}
document.addEventListener('click',e=>{if(e.target.id==='wmore'){$('wg2').classList.remove('hide');e.target.classList.add('hide')}});
function setViewer(v){VIEWER=v;store.viewer=v||'guest';save();const s0=PAGES[cur].s;buildPages();cur=IDX[s0]??0;$('who').classList.add('hide');drawMe();render(0);buildWall();if(WM==='f'&&FID)drawFocus(FID);if($('ov').classList.contains('on'))openP(OVL[OVI]);toast(v?`Привет, ${P[v].gn}! Подписи теперь для тебя`:'Смотрим как гость')}
$('wg').addEventListener('click',e=>{const b=e.target.closest('[data-who]');if(b)setViewer(b.dataset.who)});
$('guest').onclick=()=>setViewer(null);
$('btnMe').onclick=openWho;

/* ===== cover ===== */
$('mosaic').innerHTML=['family-2025', 'wedding-grand', 'vla-mar', 'ev-zhen-20', 'ale-crown', 'old7', 'ev-studio-2014', 'guitar', 'ev-grandpa-kids-2007', 'ole-alx-2026', 'dmi', 'ev-cablecar-2022', 'ant-iva', 'ev-three-2018', 'yul-young', 'old3', 'ev-tree-2008', 'zhe', 'mis-fishing-2019', 'iva-2025', 'ole-little', 'ev-ole-zhen-2006', 'kuz-unknown', 'ole-roses-2019'].map(f=>`<div><img src="photos/${f}.jpg" alt=""></div>`).join('');
function openCover(){$('cover').classList.add('up');setTimeout(()=>$('cover').classList.add('hide'),900)}
$('openBook').onclick=openCover;
$('toCover').onclick=()=>{$('cover').classList.remove('hide');requestAnimationFrame(()=>$('cover').classList.remove('up'))};

/* ===== wall ===== */
const C=i=>150+i*170, Rr=r=>70+r*250, FH=96, xy=id=>[C(POS[id][0]),Rr(POS[id][1])];
const world=$('world'),lines=$('lines'),wall=$('wall'),cv=$('canvas');
const SW=C(9)+130,SH=Rr(6)+220;
function buildWall(){
  let L='';GENS.forEach((g,r)=>{L+=`<text x="10" y="${Rr(r)+50}" class="gl">${g[0]}</text><text x="10" y="${Rr(r)+72}" class="gls">${g[1]}</text>`});
  COUPLES.forEach(([a,b])=>{const[ax,ay]=xy(a),[bx]=xy(b);L+=`<line class="sp" x1="${ax+56}" y1="${ay+FH/2}" x2="${bx-56}" y2="${ay+FH/2}"/>`});
  FAM.forEach(([par,kids])=>{const two=par.length===2;const px=two?(xy(par[0])[0]+xy(par[1])[0])/2:xy(par[0])[0];const py=two?xy(par[0])[1]+FH/2:xy(par[0])[1]+FH+84;
    const ky=xy(kids[0])[1]-14,mid=ky-26-(par.includes('pet')?16:0),xs=kids.map(k=>xy(k)[0]);L+=`<path class="lnk" d="M${px} ${py} V${mid}"/>`;const lo=Math.min(px,...xs),hi=Math.max(px,...xs);if(hi>lo)L+=`<path class="lnk" d="M${lo} ${mid} H${hi}"/>`;xs.forEach(x=>L+=`<path class="lnk" d="M${x} ${mid} V${ky}"/>`)});
  lines.setAttribute('width',SW);lines.setAttribute('height',SH);lines.innerHTML=L;world.style.width=SW+'px';world.style.height=SH+'px';
  world.querySelectorAll('.pn').forEach(n=>n.remove());
  Object.keys(POS).forEach(id=>{const p=P[id],[x,y]=xy(id);const r=relv(id);world.insertAdjacentHTML('beforeend',`<div class="pn${id===VIEWER?' me':''}" data-id="${id}" style="left:${x-75}px;top:${y}px">${avT(id)}<b>${esc(p.gn)}${pat(id)?`<em>${esc(pat(id))}</em>`:''}</b><small>${esc(fam(id))}${p.mn?' ('+esc(p.mn)+')':''}${yrs(p)?'<br>'+yrs(p):''}</small>${r?`<span class="tag${id===VIEWER?' rel':''}">${esc(r)}</span>`:''}</div>`)});
}
let s=1,tx=0,ty=0;const apply=()=>world.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;
function center(id){const r=cv.getBoundingClientRect();s=r.width<700?.62:.85;const[x,y]=xy(id);tx=r.width/2-x*s;ty=r.height*.55-(y+FH/2)*s;apply()}
function fit(){const r=cv.getBoundingClientRect();s=Math.min(r.width/SW,(r.height-70)/SH)*.97;tx=(r.width-SW*s)/2;ty=60+(r.height-60-SH*s)/2;apply()}
const zoomAt=(f,cx,cy)=>{const ns=Math.min(2,Math.max(.22,s*f));tx=cx-(cx-tx)*ns/s;ty=cy-(cy-ty)*ns/s;s=ns;apply()};
$('zi').onclick=()=>zoomAt(1.25,innerWidth/2,innerHeight/2);$('zo').onclick=()=>zoomAt(.8,innerWidth/2,innerHeight/2);$('zc').onclick=()=>center(VIEWER||'ole');$('zf').onclick=fit;
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.1:.9,e.clientX,e.clientY)},{passive:false});
const pts=new Map();let moved=false,startD=0,startS=1;
cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);moved=false;cv.setPointerCapture(e.pointerId);if(pts.size===2){const[a,b]=[...pts.values()];startD=Math.hypot(a[0]-b[0],a[1]-b[1]);startS=s}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const[px,py]=pts.get(e.pointerId);if(pts.size===1){const dx=e.clientX-px,dy=e.clientY-py;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;tx+=dx;ty+=dy;apply()}
  pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){moved=true;const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt(startS*d/startD/s,(a[0]+b[0])/2,(a[1]+b[1])/2)}});
cv.addEventListener('pointerup',e=>{const m=moved;pts.delete(e.pointerId);if(m)return;const g=document.elementFromPoint(e.clientX,e.clientY)?.closest('.pn');if(g){OVC=null;openP(g.dataset.id)}});
cv.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
let wallInit=false;
function openWall(){wall.classList.remove('hide');document.body.style.overflow='hidden';if(!wallInit){wallInit=true;requestAnimationFrame(()=>innerWidth<700?center(VIEWER||'ole'):fit())}}
function closeWall(){if(wall.classList.contains('hide'))return;wall.classList.add('hide');if(!$('ov').classList.contains('on'))document.body.style.overflow=''}
$('wallClose').onclick=closeWall;


/* ===== redesign: tabs, focus tree, lightbox swipe ===== */
function setTab(){const wallOn=!$('wall').classList.contains('hide');const k=PAGES[cur].k;const t=wallOn?'tree':k==='time'?'time':k==='map'?'map':(k==='arch'||k==='kino')?'arch':k==='tree'?'tree':'book';
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===t&&!(t==='book'&&b.closest('.navd'))))}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab]');if(t){const k=t.dataset.tab;$('chs').classList.remove('on');
    if(k==='book'){closeWall(true);openChs();return}
    if(k==='tree'){if(!$('wall').classList.contains('hide')){closeWall();return}openWall();return}
    closeWall(true);go(k);return}
  const w=e.target.closest('.whoi [data-who]');if(w){setViewer(w.dataset.who);return}
  if(e.target.closest('[data-whomore]')){openWho();return}
  const f=e.target.closest('[data-f]');if(f){FST.push(FID);drawFocus(f.dataset.f);return}
  if(e.target.closest('[data-fback]')){const p=FST.pop();if(p)drawFocus(p);return}
  const m=e.target.closest('[data-wm]');if(m){setWM(m.dataset.wm);return}
});
let FID=null,FST=[],WM=null;
const fcard=id=>`<button class="fc" data-f="${id}">${av(id)}<b>${esc(P[id].gn)}</b><small>${esc(relv(id)||fam(id))}</small></button>`;
const frow=(t,ids)=>ids.length?`<div class="fr"><div class="frt">${t}</div><div class="frr">${ids.map(fcard).join('')}</div></div>`:'';
function drawFocus(id){FID=id;const p=P[id];const par=PAR[id]||[];const sp=SPO[id];const sib=[...new Set(par.flatMap(x=>KIDS[x]||[]))].filter(x=>x!==id);const kids=KIDS[id]||[];const r=relv(id);
  $('focus').innerHTML=`<div class="fwrap in">${FST.length?`<button class="fback" data-fback="1">← назад</button>`:''}
   ${frow('Родители',par)}
   <div class="fcen b-${p.l}">${avT(id)}<h3>${esc(p.gn)}${pat(id)?`<em>${esc(pat(id))}</em>`:''}</h3><div class="meta">${esc(fam(id))}${p.mn?' ('+esc(p.mn)+')':''}${yrs(p)?' · '+yrs(p):''}</div>${r?`<span class="tag${id===VIEWER?' rel':''}">${esc(id===VIEWER?'это ты':r)}</span><br>`:''}<button class="btn" data-p="${id}">Открыть историю</button>
    ${sp?`<div class="sp">${fcard(sp)}</div>`:''}</div>
   ${frow(kids.length===1?W(kids[0],'Сын','Дочь'):'Дети',kids)}
   ${frow(sib.length===1?W(sib[0],'Брат','Сестра'):'Братья и сёстры',sib)}</div>`;
  $('focus').scrollTop=0}
function setWM(m){WM=m;wall.classList.toggle('fm',m==='f');$('focus').classList.toggle('hide',m!=='f');document.querySelectorAll('[data-wm]').forEach(b=>b.classList.toggle('on',b.dataset.wm===m));
  if(m==='f'&&!FID)drawFocus(VIEWER||'ole');if(m==='f'&&FID)drawFocus(FID);if(m==='a')requestAnimationFrame(()=>innerWidth<700?center(FID||VIEWER||'ole'):fit())}
const _ow=openWall;openWall=function(){if($('wall').classList.contains('hide'))history.pushState({layer:'wall'},'',location.href);_ow();setWM(WM||(innerWidth<700?'f':'a'));setTab()};
const _cw=closeWall;closeWall=function(pop){if(!pop&&!$('wall').classList.contains('hide')&&history.state&&history.state.layer==='wall'){history.back();return}_cw();setTab()};
addEventListener('popstate',()=>{if($('lb').classList.contains('on')){closeLb(true);return}if($('ov').classList.contains('on')){closeP(true);return}if(!$('wall').classList.contains('hide')){closeWall(true);return}$('chs').classList.remove('on')});
/* lightbox list */
let LBL=[],LBI=0;
document.addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(!b)return;const g=b.closest('.gal');LBL=g?[...g.querySelectorAll('[data-lb]')].map(x=>[x.dataset.lb,x.dataset.cap]):[[b.dataset.lb,b.dataset.cap]];LBI=Math.max(0,LBL.findIndex(x=>x[0]===b.dataset.lb));lbUi()},true);
function lbUi(){const many=LBL.length>1;$('lbPv').classList.toggle('hide',!many);$('lbNx').classList.toggle('hide',!many);$('lbC').textContent=many?`${LBI+1} / ${LBL.length}`:''}
function lbStep(d){if(LBL.length<2)return;LBI=(LBI+d+LBL.length)%LBL.length;$('lbI').src=LBL[LBI][0];$('lbP').textContent=LBL[LBI][1]||'';lbUi()}
$('lbPv').addEventListener('click',e=>{e.stopPropagation();lbStep(-1)});$('lbNx').addEventListener('click',e=>{e.stopPropagation();lbStep(1)});
addEventListener('keydown',e=>{if(!$('lb').classList.contains('on')||!$('lbV').classList.contains('hide'))return;if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1)});
{let x0=null;$('lb').addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});$('lb').addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50&&$('lbV').classList.contains('hide'))lbStep(dx<0?1:-1)},{passive:true})}
setTab();

/* ===== start ===== */
drawMe();buildWall();
const h0=location.hash.slice(1);
const fromHash=h=>{if(IDX[h]!==undefined){cur=IDX[h];return 1}if(h.startsWith('p-')&&P[h.slice(2)]){cur=IDX['ch-'+HOME[h.slice(2)]];return 2}return 0};
const hk=fromHash(h0);
if(hk){$('cover').classList.add('hide','up')}
render(0);if(hk===2)openP(h0.slice(2));
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h.startsWith('p-')&&P[h.slice(2)]){if(!$('ov').classList.contains('on')||OVL[OVI]!==h.slice(2)){$('cover').classList.add('hide','up');openP(h.slice(2))}return}
  if(IDX[h]!==undefined&&IDX[h]!==cur){$('cover').classList.add('hide','up');if($('ov').classList.contains('on'))closeP(true);closeWall(true);go(h)}});
