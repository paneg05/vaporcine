import { Router } from "express";
import uploadRout from "./uploadRout/uploadRout";

const router = Router();

// Example route
router.get("/", (req, res) => {
  res.send("Welcome to Vaporcine API!");
});

router.options(async (req, res) => {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
  });
  res.end();
});

router.post("/", uploadRout);
export default router;
