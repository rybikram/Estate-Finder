import expres from 'express'
import { test } from '../controllers/user.controller.js'

const router = expres.Router()

router.get('/test', test)

export default router