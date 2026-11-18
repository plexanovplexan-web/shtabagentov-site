// Интерактив остаётся в браузере: ни запросов к ИИ, ни отправки заявок.
(()=>{
'use strict';
const $=id=>document.getElementById(id),M=window.PortfolioModel;
const caseList=JSON.parse($('case-data').textContent);
const topicCopy={
agents:{title:'Агенты работают по вашим правилам',description:'Учимся давать общий контекст, распределять задачи между Claude Code и Codex и принимать результат по проверкам.',points:['Понятное задание и границы действий','Передача работы между агентами','Проверка логики и исправление ошибок']},
n8n:{title:'Понимать логику своего workflow',description:'Разбираем один сценарий: что приходит на вход, где принимается решение и как проверить результат.',points:['Передача данных между узлами','Пустые значения и ошибки внешнего сервиса','Понятные тесты на учебных данных']},
vps:{title:'Свой сервер — по понятным шагам',description:'Выбираем один этап установки и учимся проверять его результат. Среду и объём согласуем заранее.',points:['SSH-ключи и проверка доступа','Логика развёртывания контейнерного сервиса','Проверка состояния и следующий безопасный шаг']}
};
let state=M.normalize(),lastCaseTrigger=null,learnTopic='agents',buildTopic='agents';
function updateRequest(topicOverride){
 state=M.normalize({...state,topic:typeof topicOverride==='string'?topicOverride:$('request-topic').value,plan:$('request-plan').value,level:$('level').value,task:$('request-task').value});
 document.querySelectorAll('[data-request-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.requestType===state.type)));
 const build=state.type==='build';
 const allowed=Object.entries(M.TOPICS).filter(([key])=>build||key!=='web');
 const select=$('request-topic');
 if([...select.options].map(x=>x.value).join(',')!==allowed.map(([key])=>key).join(',')){
  select.replaceChildren(...allowed.map(([key,title])=>{const option=document.createElement('option');option.value=key;option.textContent=title;return option;}));
 }
 select.value=state.topic;
 if(build)buildTopic=state.topic;else learnTopic=state.topic;
 $('plan-field').hidden=build;$('request-plan').disabled=build;$('level-field').hidden=build;$('level').disabled=build;$('build-terms').hidden=!build;
 $('request-draft').textContent=M.request(state);
 $('request-status').textContent='Текст остаётся на этой странице. Ничего не отправлено.';
}
function setType(type){const next=type==='build'?'build':'learn';if(next===state.type){updateRequest();return;}state.type=next;updateRequest(next==='learn'?learnTopic:buildTopic);}
function setTopic(key){
 const t=topicCopy[key];if(!t)return;
 document.querySelectorAll('.topic-list [data-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===key)));
 $('topic-title').textContent=t.title;$('topic-description').textContent=t.description;
 $('topic-points').replaceChildren(...t.points.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 state.type='learn';updateRequest(key);
}
document.querySelectorAll('[data-topic]').forEach(b=>b.addEventListener('click',()=>setTopic(b.dataset.topic)));
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.type)));
document.querySelectorAll('[data-request-type]').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.requestType)));
document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{state.type='learn';$('request-plan').value=b.dataset.plan;updateRequest(learnTopic);}));
['request-topic','request-plan','level'].forEach(id=>$(id).addEventListener('change',updateRequest));
$('request-task').addEventListener('input',updateRequest);
$('request-form').addEventListener('submit',e=>e.preventDefault());
const menu=document.querySelector('.menu-toggle');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('main-nav').classList.toggle('open',open);});
$('main-nav').addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');$('main-nav').classList.remove('open');}});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
 const key=b.dataset.filter,visible=M.filtered(caseList,key);
 const ids=new Set(visible.map(c=>c.id));
 document.querySelector('.project-grid').classList.toggle('filtered',key!=='all');
 document.querySelectorAll('.project-card').forEach(card=>{card.hidden=!ids.has(card.dataset.id);});
 document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 $('filter-status').textContent='Показано проектов: '+visible.length+'.';
}));
function updateScenario(){const s=M.scenario($('scenario').value);$('scenario-answer').textContent=s.text;$('scenario-check').textContent=s.check;$('prompt').textContent=s.prompt;$('prompt-status').textContent='Учебное задание обновлено. ИИ не запускался.';}
$('scenario').addEventListener('change',updateScenario);
async function copy(text,status){try{if(!navigator.clipboard?.writeText)throw new Error('Нет Clipboard API');await navigator.clipboard.writeText(text);$(status).textContent='Скопировано. Теперь отправьте текст сами в исходной переписке.';}catch{$(status).textContent='Автокопирование недоступно. Выделите текст выше и скопируйте вручную.';}}
$('copy-request').addEventListener('click',()=>copy($('request-draft').textContent,'request-status'));
$('copy-prompt').addEventListener('click',()=>copy($('prompt').textContent,'prompt-status'));
const dialog=$('case-dialog');
function closeCase(){if(!dialog.open)return;if(history.state?.portfolioCase){history.back();}else{history.replaceState(null,'','#projects');syncCase();}}
function syncCase(){
 const match=location.hash.match(/^#case-([a-z]+)$/),id=match?.[1],item=caseList.find(c=>c.id===id);
 if(!item){if(dialog.open){dialog.close();document.body.style.overflow='';lastCaseTrigger?.focus();}return;}
 const source=document.querySelector('[data-id="'+id+'"] .case-full');
 const content=document.createElement('div');content.className='dialog-body';
 const kind=document.createElement('span');kind.className='case-kind';kind.textContent=item.kind;
 const heading=document.createElement('h2');heading.id='dialog-title';heading.textContent=item.title;
 content.append(kind,heading,source.cloneNode(true));$('dialog-content').replaceChildren(content);
 content.querySelectorAll('h4').forEach(old=>{const h=document.createElement('h3');h.textContent=old.textContent;old.replaceWith(h);});
 lastCaseTrigger=document.querySelector('.case-open[data-case="'+id+'"]');
 $('case-status').textContent='Ссылка открывает этот кейс в текущем предпросмотре.';$('case-request').dataset.caseTopic=item.tags.includes('infra')?'vps':item.tags.includes('web')?'web':'agents';
 if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}$('close-case').focus();
}
document.querySelectorAll('summary[data-case]').forEach(summary=>{
 if(typeof dialog.showModal!=='function')return;
 const button=document.createElement('button');button.type='button';button.className='case-open';button.dataset.case=summary.dataset.case;
 button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','case-dialog');
 button.append(...[...summary.childNodes].map(n=>n.cloneNode(true)));
 const details=summary.closest('details');details.before(button);details.hidden=true;
 button.addEventListener('click',()=>{lastCaseTrigger=button;history.pushState({portfolioCase:true},'','#case-'+button.dataset.case);syncCase();});
});
$('close-case').addEventListener('click',closeCase);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeCase();});
dialog.addEventListener('keydown',e=>{
 if(e.key!=='Tab')return;
 const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(x=>x.getClientRects().length);
 const first=controls[0],last=controls.at(-1),active=document.activeElement;
 if(e.shiftKey&&(active===first||active===dialog)){e.preventDefault();last?.focus();}
 else if(!e.shiftKey&&active===last){e.preventDefault();first?.focus();}
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCase();}});
window.addEventListener('hashchange',syncCase);window.addEventListener('popstate',syncCase);
$('copy-case').addEventListener('click',()=>copy(location.href,'case-status'));
$('case-request').addEventListener('click',()=>{const topic=$('case-request').dataset.caseTopic;setType('build');updateRequest(topic);history.replaceState(null,'','#request');syncCase();$('request-task').focus({preventScroll:true});$('request').scrollIntoView();});
updateRequest();updateScenario();syncCase();
// Измерения только для локальной рамки QA; данные не покидают текущий origin.
if(location.search==='?qa=1'&&window.parent!==window){
 const report=()=>window.parent.postMessage({type:'portfolioQA',width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,captionGaps:[...document.querySelectorAll('.project-card')].map(card=>({id:card.dataset.id,gap:Math.round(card.querySelector(':scope > .cover-label').getBoundingClientRect().top-card.querySelector('.project-cover').getBoundingClientRect().bottom)})),heroButtons:[...document.querySelectorAll('.hero-actions a')].map(e=>({text:e.textContent.trim(),bottom:Math.round(e.getBoundingClientRect().bottom)}))},location.origin);
 window.addEventListener('load',report);window.addEventListener('resize',report);report();
}
})();
