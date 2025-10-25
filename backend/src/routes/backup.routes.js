const express = require("express")
const router = express.Router()
const multer = require("multer")
const backupController = require("../controllers/backup.controller")
const { authorizeAdmin } = require("../middlewares/auth.middleware")

router.get("/download", authorizeAdmin, backupController.downloadBackup)

const upload = multer({ storage: multer.memoryStorage() }) // stock en mémoire pour éviter disque
router.post("/restore", upload.single("file"), backupController.restoreBackup)

module.exports = router
