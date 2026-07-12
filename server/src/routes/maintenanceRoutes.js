const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', maintenanceController.getAll);

const maintenanceValidation = [
  body('vehicle_id').isInt().withMessage('Vehicle ID is required'),
  body('service_type').notEmpty().withMessage('Service type is required'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').optional().isIn(['Scheduled', 'In Progress', 'Completed']).withMessage('Invalid status'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Safety Officer'), maintenanceValidation, maintenanceController.create);

module.exports = router;