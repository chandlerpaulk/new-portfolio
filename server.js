const path = require('path')
const express = require('express')

const app = express()

const PORT = process.env.PORT || 5000

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, (err) => {
    if (err) console.log('Error in server setup')
    console.log('Portfolio Server listening on Port:', PORT)
})