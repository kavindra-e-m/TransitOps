const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/summary', rbac('Fleet Manager', 'Financial Analyst'), analyticsController.getSummary);
router.get('/monthly-revenue', rbac('Fleet Manager', 'Financial Analyst'), analyticsController.getMonthlyRevenue);
router.get('/top-costliest-vehicles', rbac('Fleet Manager', 'Financial Analyst'), analyticsController.getTopCostliestVehicles);

module.exports = router;