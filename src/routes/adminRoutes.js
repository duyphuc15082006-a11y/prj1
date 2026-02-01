const express = require('express');
const { listAllUsers, lockUser, deleteUserAdmin, createVocabAdmin, updateVocabAdmin, deleteVocabAdmin, bulkVocabAdmin } = require('../controllers/adminController');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminOnly);

router.get('/users', listAllUsers);
router.patch('/users/:id/lock', lockUser);
router.delete('/users/:id', deleteUserAdmin);

router.post('/vocab', createVocabAdmin);
router.put('/vocab/:id', updateVocabAdmin);
router.delete('/vocab/:id', deleteVocabAdmin);
router.post('/vocab/bulk', bulkVocabAdmin);

module.exports = router;
