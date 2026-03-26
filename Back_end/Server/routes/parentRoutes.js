const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.get('/', parentController.getParents);

router.get('/:id', parentController.getParentById);

router.post('/add', parentController.addParentWithChildren);

router.put('/:id', parentController.updateParent);

router.delete('/:id', parentController.deleteParent);

module.exports = router;