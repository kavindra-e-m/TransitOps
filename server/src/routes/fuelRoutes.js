const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', fuelController.getAll);

const fuelValidation = [
  body('vehicle_id').isInt().withMessage('Vehicle ID is required'),
  body('liters').isNumeric().withMessage('Liters must be a number'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('odometer_at_fill').isNumeric().withMessage('Odometer is required'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Financial Analyst'), fuelValidation, fuelController.create);

module.exports = router;