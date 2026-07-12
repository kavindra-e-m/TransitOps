const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/rbac-matrix', rbacController.getRbacMatrix);

module.exports = router;