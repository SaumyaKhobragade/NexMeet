import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get_all_activity", getUserHistory);
router.post("/add_to_activity", addToHistory);

export default router;
