const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category');

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

router.post('/create', checkAuth, checkAdmin, errorAdmin, categoryController.createCategory);

router.put('/update/:id', checkAuth, checkAdmin, errorAdmin, categoryController.updateCategory);

router.get('/', categoryController.getCategories)

router.get('/:id', checkAuth, checkAdmin, errorAdmin, categoryController.getCategory);

router.delete('/:id', checkAuth, checkAdmin, errorAdmin, categoryController.deleteCategory)

module.exports = router;