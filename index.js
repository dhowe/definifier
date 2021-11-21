
let rita = require('rita');
let rawdict = require('./dictionary.json');

let dict = {}; //[n, a, v, r -> prep, interj, conj, pron]
rawdict.forEach((o, i) => {
  if (o.pos === 'adv.') o.pos = 'r.'; // 
  if (!/^[anvr]\.$/.test(o.pos)) return;
  let key = (o.word + '$' + o.pos.slice(0, 1)).toLowerCase(); // word$pos
  dict[key] = { defs: o.definitions, pos: o.pos };
});
//console.log(dict.fish$n); process.exit();

let text = "A CARAFE, THAT IS A BLIND GLASS.\n A kind in glass and a cousin, a spectacle and nothing strange a single hurt color and an arrangement in a system to pointing. All this and not ordinary, not unordered in not resembling. The difference is spreading.";
text = "Then, while the old man was clearing the lines and preparing the harpoon, the male fish jumped high into the air beside the boat to see where the female was and then went down deep, his lavender wings, that were his pectoral fins, spread wide and all his wide lavender stripes showing. He was beautiful, the old man remembered, and he had stayed.";
text = "A huge lizard was discovered drinking out of the fountain today.It was not menacing anyone, it was just very thirsty.A small crowd gathered and whispered to one another, as though the lizard would understand them if they spoke in normal voices.The lizard seemed not even a little perturbed by their gathering.It drank and drank, its long forked tongue was like a red river hypnotizing the people, keeping them in a trance - like state. 'It's like a different town,'one of them whispered. 'Change is good,' the other one whispered back."

let leadins = ['name loosely applied in popular usage to ', 'of or pertaining to the ', 'any one of the numerous '];
let customs = {
  small$a: ['diminuitive', 'minor'],
  town$n: ['a metropolis or its inhabitants']
};
let ignores = ['then', 'not', 'back'];
//console.log(dict.town$n); process.exit();
let defIdxs = {};
let words = rita.tokenize(text);
let tags = rita.pos(words, { simple: true })
let igre = new RegExp(ignores.reduce((acc, w) => acc + w + '|', '').slice(0, -1));
//process.exit();
words.forEach((w, i) => {
  if (w.length >= 3 && tags[i] !== '-' && !igre.test(w.toLowerCase())) {
    let key = (w + '$' + tags[i]).toLowerCase();
    if (key in dict || key in customs) {
      let defs = (key in customs) ? customs[key]: dict[key].defs;
      if (defs.length) {
        if (!defIdxs[key]) defIdxs[key] = 0;
        let defIdx = defIdxs[key] ;
        //console.log(i, w + ':', defs.length);
        let def = defs[defIdx].split(/[.,;]/)[0].toLowerCase();
        //console.log(w,'"'+def+'"');
        for (let i = 0; i < 100; i++) {
          let tmp = def.replace(/^(a|an|the|to|of the|be) /g, '');
          if (tmp === def) break;
          def = tmp;
        }
        for (let k = 0; k < leadins.length; k++) {
          def = def.replace(new RegExp('^' + leadins[k]), '');
        }
        //console.log(w + '('+defIdx+'/'+defs.length+'): ' + def + "\n");
        words[i] = 1 ? def : '[' + def + ']';
        defIdxs[key] = (defIdx + 1) % defs.length;
      }
    }
  }
});
let output = rita.untokenize(words);
console.log('\n',output);