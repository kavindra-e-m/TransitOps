const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', settingsController.getSettings);
router.put('/', rbac('Fleet Manager'), settingsController.updateSettings);

module.exports = router;