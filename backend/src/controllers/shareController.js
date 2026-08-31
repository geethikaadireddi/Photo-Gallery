const prisma = require('../config/prisma');

// @route GET /api/share/:accessCode  (PUBLIC - no login required)
async function getSharedAlbum(req, res) {
  try {
    const { accessCode } = req.params;

    const album = await prisma.album.findUnique({
      where: { accessCode },
      include: {
        photos: { orderBy: { createdAt: 'desc' } },
        owner: { select: { name: true } } // only expose owner's name, nothing sensitive
      }
    });

    if (!album) {
      return res.status(404).json({ message: 'Invalid or expired access code' });
    }

    res.json({
      album: {
        id: album.id,
        title: album.title,
        description: album.description,
        coverImage: album.coverImage,
        ownerName: album.owner.name,
        photos: album.photos
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load shared album', error: err.message });
  }
}

module.exports = { getSharedAlbum };