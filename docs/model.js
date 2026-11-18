// Чистая логика выбора: без сети, хранилища и отправки данных.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PortfolioModel=factory();})(globalThis,()=>{
'use strict';
const TOPICS={agents:'Claude Code и Codex',n8n:'Автоматизация в n8n',vps:'Сервисы на VPS',web:'Сайт или CRM'};
const PLANS={short:'Разбор — 60 минут, 15 USD',practice:'Практика — 90 минут, 30 USD',route:'Четыре практики — 4 × 90 минут, 99 USD'};
const LEVELS={start:'начинаю разбираться',tried:'уже пробовал, нужна помощь',project:'есть собственный проект'};
const STATES={running:{text:'Контейнер работает',check:'Состояние running должно давать сообщение о работающем контейнере.'},stopped:{text:'Контейнер остановлен',check:'Остановку нельзя выдавать за исправную работу.'},unknown:{text:'Статус неизвестен — нужна проверка',check:'Неизвестное значение не означает, что всё работает.'},missing:{text:'Нет данных о статусе — нужна проверка',check:'Отсутствующие данные нельзя заменять предположением об исправности.'}};
function normalize(input={}){const type=input.type==='build'?'build':'learn';return {type,topic:Object.hasOwn(TOPICS,input.topic)&&(type==='build'||input.topic!=='web')?input.topic:'agents',plan:Object.hasOwn(PLANS,input.plan)?input.plan:'short',level:Object.hasOwn(LEVELS,input.level)?input.level:'start',task:typeof input.task==='string'?input.task.trim().slice(0,500):''};}
function request(input){const s=normalize(input);return s.type==='learn'?
'Здравствуйте! Хочу обсудить обучение: '+TOPICS[s.topic]+'. Формат: '+PLANS[s.plan]+'. Мой уровень: '+LEVELS[s.level]+'.'+(s.task?' Моя задача: '+s.task:' Давайте выберем одну практическую задачу.')+' Согласуем объём и время встречи до начала.':
'Здравствуйте! Хочу обсудить внедрение: '+TOPICS[s.topic]+'.'+(s.task?' Моя задача: '+s.task:' Нужна помощь с уточнением задачи.')+' Давайте согласуем результат, объём, стоимость и сроки отдельно.';}
function scenario(key){const s=STATES[key]||STATES.unknown;return {text:s.text,check:s.check,prompt:'Работай только с учебными данными. Не подключайся к серверу, не выполняй команды управления и не меняй файлы.\n\nСпроектируй обработчик статуса контейнера: running, stopped, неизвестное или отсутствующее значение. Сейчас проверяем: '+(Object.hasOwn(STATES,key)?key:'unknown')+'. Ожидаемый ответ: «'+s.text+'».\n\nСначала предложи таблицу ожидаемых ответов и план. Не считай неизвестный или отсутствующий статус признаком исправности. К коду переходи после согласования.'};}
function filtered(items,filter){return filter==='all'?items:items.filter(x=>x.tags.includes(filter));}
return {TOPICS,PLANS,LEVELS,normalize,request,scenario,filtered};
});
