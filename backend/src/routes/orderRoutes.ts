import { Router } from 'express';
import { create, getAll, getById } from '../controllers/orderController';

const router = Router();
router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);

export default router;
