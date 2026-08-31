const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');
const {
  uploadPhotos,
  getPhotos,
  deletePhoto,
  toggleFavorite
} = require('../controllers/photoController');

router.use(protect);

router.post('/:albumId', upload.array('photos', 10), uploadPhotos); // up to 10 files at once
router.get('/:albumId', getPhotos);
router.delete('/:photoId', deletePhoto);
router.patch('/:photoId/favorite', toggleFavorite);

module.exports = router;