const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const tripController = require('../controllers/tripController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', tripController.getAll);
router.get('/available-vehicles', tripController.getAvailableVehicles);
router.get('/available-drivers', tripController.getAvailableDrivers);

const tripValidation = [
  body('source').notEmpty().withMessage('Source is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('vehicle_id').isInt().withMessage('Vehicle ID is required'),
  body('driver_id').isInt().withMessage('Driver ID is required'),
  body('cargo_weight').isNumeric().withMessage('Cargo weight must be a number'),
  body('planned_distance').isNumeric().withMessage('Planned distance must be a number'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Dispatcher'), tripValidation, tripController.create);
router.patch('/:id/dispatch', rbac('Fleet Manager', 'Dispatcher'), tripController.dispatch);
router.patch('/:id/complete', rbac('Fleet Manager', 'Dispatcher'), tripController.complete);
router.patch('/:id/cancel', rbac('Fleet Manager', 'Dispatcher'), tripController.cancel);

module.exports = router;