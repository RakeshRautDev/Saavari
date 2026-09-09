import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { getAddressCoordinate } from '../services/maps.service,js';

const router=Router();

router.get("/get-coordinates",authUser,getAddressCoordinate)

export default router;