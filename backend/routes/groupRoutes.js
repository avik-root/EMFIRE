const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroupDetails);
router.post('/:groupId/request-join', groupController.requestToJoinGroup);

module.exports = router;