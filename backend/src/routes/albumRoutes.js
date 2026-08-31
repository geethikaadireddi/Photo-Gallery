const express = require('express');
const router = express.Router();
const {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  generateShareCode,
  revokeShareCode
} = require('../controllers/albumController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createAlbum);
router.get('/', getAlbums);
router.get('/:id', getAlbumById);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);
router.post('/:id/share', generateShareCode);
router.delete('/:id/share', revokeShareCode);

module.exports = router;