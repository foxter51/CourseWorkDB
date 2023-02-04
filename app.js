const express = require('express')
const app = express()
const path = require('path');
const indexRouter = require(__dirname + '/routes/indexRouter')

app.use(indexRouter)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.listen(3000, () => {
    console.log('Application started and Listening on port 3000')
})
module.exports = app

