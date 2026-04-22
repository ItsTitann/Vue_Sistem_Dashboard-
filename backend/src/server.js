import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import finanzasRouter from './routes/finanzas.js'
import inventarioRouter from './routes/inventario.js'
import clientesRouter from './routes/clientes.js'

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/finanzas', finanzasRouter)
app.use('/api/inventario', inventarioRouter)
app.use('/api/clientes', clientesRouter)

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
