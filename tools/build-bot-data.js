/* Собирает данные для семейного бота из книги.
   Запуск: node tools/build-bot-data.js ../korni-inbox/gas/Data.js
   Берёт людей, вопросы и дни рождения из js/data.js, чтобы бот и сайт не расходились. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const out = process.argv[2] || path.join(__dirname, '../../korni-inbox/gas/Data.js');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8').replace(/^(const|let) /mg, 'var '), ctx);
const P = ctx.P;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/tree.js'), 'utf8').replace(/^(const|let) /mg, 'var '), ctx);
const G = ctx.G;
const SHORT = {kos:'Костя',zhen:'Женя',mis:'Миша',ant:'Тоня',tat:'Таня',sve:'Света',ivn:'Ваня',alx:'Лёша',dar:'Даша',iva:'Саша',yul:'Юля',ole:'Олеся',zoy:'Зоя'};
// Короткие слова для дней памяти. Дедушку не называем ушедшим, просто вспоминаем.
const NOTES = {dmi:'Военный врач, ветеран войны.', mar:'Жена Владимира Петрова.', vad:'Сын Дмитрия и Ольги.',
  ale:'Это он начал собирать нашу семейную книгу.', ama:'Мама Владимира Ивановича, бабушка Зои Владимировны по отцу.'};
const full = p => { const [sn, ...rest] = p.nm.split(' '); return [...rest, sn].join(' '); };
const people = {}, questions = [], births = [];
for (const [id, p] of Object.entries(P)) {
  people[id] = {full: full(p), g: G[id] || 'm'};
  (p.ask || []).forEach((q, i) => questions.push({id, i, who: full(p), q}));
  const m = String(p.born || '').match(/^(\d\d)\.(\d\d)\.(\d{4})$/);
  if (m && !(m[1] === '01' && m[2] === '01'))   // 01.01 у нас значит «дата неизвестна»
    births.push({id, dm: m[1] + '.' + m[2], y: +m[3], full: full(p), short: SHORT[id] || p.gn,
      memory: !!p.died || id === 'ale' || +m[3] < 1930,  // старшие поколения вспоминаем, а не поздравляем
      g: G[id] || 'm', note: NOTES[id] || ''});
}
const js = '// Сгенерировано tools/build-bot-data.js из книги. Руками не править.\n' +
  'var PEOPLE = ' + JSON.stringify(people) + ';\n' +
  'var QUESTIONS = ' + JSON.stringify(questions) + ';\n' +
  'var BIRTHS = ' + JSON.stringify(births) + ';\n';
fs.writeFileSync(out, js);
console.log('людей', Object.keys(people).length, 'вопросов', questions.length, 'дней рождения', births.length);
