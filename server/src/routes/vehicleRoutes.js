const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', vehicleController.getAll);
router.get('/check-reg/:regNo', vehicleController.checkReg);

const vehicleValidation = [
  body('reg_no').notEmpty().withMessage('Registration number is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('capacity').isNumeric().withMessage('Capacity must be a number'),
  body('acquisition_cost').isNumeric().withMessage('Acquisition cost must be a number'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Dispatcher'), vehicleValidation, vehicleController.create);
router.put('/:id', rbac('Fleet Manager', 'Dispatcher'), vehicleValidation, vehicleController.update);
router.get('/:id/history', vehicleController.getHistory);

module.exports = router;