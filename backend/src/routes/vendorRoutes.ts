import { Router } from 'express';
import { getVendorProducts, getVendors } from '../controllers/vendorController';

const router = Router();
router.get('/', getVendors);
router.get('/:vendorId/products', getVendorProducts);

export default router;
