const app = require('./app')
const {PORT} = require('./utils/config')
const { infolog } = require('./utils/logger')

app.listen(PORT, () => {
    infolog(`server listening in port ${PORT}`)
})