import { Router } from "express";
import { login, register, verifyRegister } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/register/verify", verifyRegister);
router.post("/login", login);

export default router;
