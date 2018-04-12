// This is just so Chrome doesn't complain about cross origin nonsense

let express = require('express')
let path = require('path')
let app = express()

app.use(express.static(__dirname + '/public', {
  dotfiles: 'allow',
  setHeaders: function(res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*')
  }
}))

app.route('/sendfile', (req, res) => {
  console.log(JSON.stringify(req))
})

app.listen(8080, (err, res) => {
  console.log('Listening')
})