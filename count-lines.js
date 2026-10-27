const fs = require('fs')
const p = 'c:/Users/User18/Desktop/juridique/src/app/admin/calendrier/page.tsx'
const lines = fs.readFileSync(p, 'utf8').split('\n')
console.log(lines.length + ' lines')
console.log('---LAST 10---')
console.log(lines.slice(-10).join('\n'))