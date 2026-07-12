const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const driverController = require('../controllers/driverController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', driverController.getAll);

const driverValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('license_no').notEmpty().withMessage('License number is required'),
  body('license_category').notEmpty().withMessage('License category is required'),
  body('license_expiry').isISO8601().withMessage('Valid expiry date is required'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Dispatcher'), driverValidation, driverController.create);
router.put('/:id', rbac('Fleet Manager', 'Dispatcher'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('license_category').notEmpty().withMessage('License category is required'),
  body('license_expiry').isISO8601().withMessage('Valid expiry date is required'),
  validate
], driverController.update);

router.patch('/:id/status', rbac('Fleet Manager', 'Dispatcher'), [
  body('status').isIn(['Available', 'On Trip', 'Suspended']).withMessage('Invalid status'),
  validate
], driverController.updateStatus);

module.exports = router;