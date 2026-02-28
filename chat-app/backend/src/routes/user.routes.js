import express from 'express';
import { getUsersForSideBar } from '../controller/user.controller.js';
import { isLoggedIn } from '../middleware/login.middleware.js';

const router = express.Router();

router.get('/', isLoggedIn, getUsersForSideBar);

export default router;