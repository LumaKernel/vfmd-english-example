const chokidar = require('chokidar')
const unified = require('unified')
const retext = require('retext')
const spell = require('retext-spell')
const redundantAcronyms = require('retext-redundant-acronyms')
const dictionary = require('dictionary-en-gb');
const english = require('retext-english')
const equality = require('retext-equality')
const simplify = require('retext-simplify')
const sentiment = require('retext-sentiment')
const profanities = require('retext-profanities')
const readability = require('retext-readability')
const indefiniteArticle = require('retext-indefinite-article')
const stringify = require('retext-stringify')
const vfile = require('to-vfile')
const repeatedWords = require('retext-repeated-words')
const passive = require('retext-passive')
const diacritics = require('retext-diacritics')
const quotes = require('retext-quotes')
const contractions = require('retext-contractions')
const intensify = require('retext-intensify')
const emoji = require('retext-emoji')
const sentenceSpacing = require('retext-sentence-spacing')
const mentions = require('retext-syntax-mentions')
const report = require('vfile-reporter-pretty')
const {reportToDaemon} = require('vfmd');
const fs = require('fs');
const pathG = require('path');

chokidar.watch(pathG.posix.resolve(__dirname, "../writings/**/*")).on('all', (event, path) => {
  console.info(event, path);
  if(!fs.existsSync(path)) return;

  unified()
    .use(english)
    .use(spell, dictionary)
    .use(equality)
    .use(simplify)
    .use(profanities)
    .use(readability)
    .use(indefiniteArticle)
    .use(repeatedWords)
    .use(passive)
    .use(intensify)
    .use(quotes)
    .use(diacritics)
    .use(mentions)
    .use(contractions)
    .use(sentenceSpacing)
    .use(redundantAcronyms)
    .use(emoji, { convert: "encode" })
    .use(stringify)
    .process(vfile.readSync(path), async (err, file) => {
      if(err) return console.error(err)

      console.info(report([file]))
      await reportToDaemon(file)

      if(file.dirname) {
        file.dirname = pathG.resolve(file.dirname, "../out")
        fs.mkdirSync(file.dirname, { recursive: true });
        vfile.writeSync(file)
      }
    })
})
