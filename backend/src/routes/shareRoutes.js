const express = require('express');
const router = express.Router();
const { getSharedAlbum } = require('../controllers/shareController');

// No protect middleware - intentionally public
router.get('/:accessCode', getSharedAlbum);

module.exports = router;