const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');

// helper: confirm the album belongs to the logged-in user
async function getOwnedAlbum(albumId, userId) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) return { error: 404, message: 'Album not found' };
  if (album.ownerId !== userId) return { error: 403, message: 'Not authorized for this album' };
  return { album };
}

// @route POST /api/photos/:albumId  (multipart/form-data, field name "photos", supports multiple)
async function uploadPhotos(req, res) {
  try {
    const { albumId } = req.params;
    const check = await getOwnedAlbum(albumId, req.user.id);
    if (check.error) return res.status(check.error).json({ message: check.message });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const photos = await prisma.$transaction(
      req.files.map(file =>
        prisma.photo.create({
          data: {
            url: file.path,        // Cloudinary secure URL
            publicId: file.filename, // Cloudinary public_id
            albumId
          }
        })
      )
    );

    // If album has no cover yet, set it to the first uploaded photo
    if (!check.album.coverImage) {
      await prisma.album.update({
        where: { id: albumId },
        data: { coverImage: photos[0].url }
      });
    }

    res.status(201).json({ photos });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
}

// @route GET /api/photos/:albumId
async function getPhotos(req, res) {
  try {
    const { albumId } = req.params;
    const { favorite } = req.query;

    const check = await getOwnedAlbum(albumId, req.user.id);
    if (check.error) return res.status(check.error).json({ message: check.message });

    const photos = await prisma.photo.findMany({
      where: {
        albumId,
        ...(favorite === 'true' && { isFavorite: true })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ photos });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch photos', error: err.message });
  }
}

// @route DELETE /api/photos/:photoId
async function deletePhoto(req, res) {
  try {
    const { photoId } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { album: true }
    });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    if (photo.album.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await cloudinary.uploader.destroy(photo.publicId);
    await prisma.photo.delete({ where: { id: photoId } });

    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete photo', error: err.message });
  }
}

// @route PATCH /api/photos/:photoId/favorite
async function toggleFavorite(req, res) {
  try {
    const { photoId } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { album: true }
    });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    if (photo.album.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.photo.update({
      where: { id: photoId },
      data: { isFavorite: !photo.isFavorite }
    });

    res.json({ photo: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update favorite', error: err.message });
  }
}

module.exports = { uploadPhotos, getPhotos, deletePhoto, toggleFavorite };