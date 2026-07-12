const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

router.get('/', expenseController.getAll);
router.get('/operational-cost', rbac('Fleet Manager', 'Financial Analyst'), expenseController.getOperationalCost);

const expenseValidation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  validate
];

router.post('/', rbac('Fleet Manager', 'Financial Analyst'), expenseValidation, expenseController.create);

module.exports = router;