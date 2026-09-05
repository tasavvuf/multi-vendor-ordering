import { Router } from 'express';
import { getVendors } from '../controllers/vendorController';

const router = Router();
router.get('/', getVendors);

export default router;
