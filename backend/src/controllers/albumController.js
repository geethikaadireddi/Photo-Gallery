const prisma = require('../config/prisma');

// @route POST /api/albums
async function createAlbum(req, res) {
  try {
    const { title, description, coverImage, isPublic } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Album title is required' });
    }

    const album = await prisma.album.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        isPublic: !!isPublic,
        ownerId: req.user.id
      }
    });

    res.status(201).json({ album });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create album', error: err.message });
  }
}

// @route GET /api/albums
async function getAlbums(req, res) {
  try {
    const { sort, search } = req.query;

    const orderBy =
      sort === 'name' ? { title: 'asc' } : { createdAt: 'desc' };

    const albums = await prisma.album.findMany({
      where: {
        ownerId: req.user.id,
        ...(search && {
          title: { contains: search, mode: 'insensitive' }
        })
      },
      orderBy,
      include: {
        _count: { select: { photos: true } }
      }
    });

    const result = albums.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      coverImage: a.coverImage,
      isPublic: a.isPublic,
      hasAccessCode: !!a.accessCode,
      photoCount: a._count.photos,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    res.json({ albums: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch albums', error: err.message });
  }
}
// @route GET /api/albums/:id
async function getAlbumById(req, res) {
  try {
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: { photos: { orderBy: { createdAt: 'desc' } } }
    });

    if (!album) return res.status(404).json({ message: 'Album not found' });
    if (album.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this album' });
    }

    res.json({ album });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch album', error: err.message });
  }
}

// @route PUT /api/albums/:id
async function updateAlbum(req, res) {
  try {
    const existing = await prisma.album.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Album not found' });
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this album' });
    }

    const { title, description, coverImage, isPublic } = req.body;

    const album = await prisma.album.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublic !== undefined && { isPublic })
      }
    });

    res.json({ album });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update album', error: err.message });
  }
}

// @route DELETE /api/albums/:id
async function deleteAlbum(req, res) {
  try {
    const existing = await prisma.album.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Album not found' });
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this album' });
    }

    // Cascade delete removes photos too (see schema onDelete: Cascade)
    await prisma.album.delete({ where: { id: req.params.id } });

    res.json({ message: 'Album deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete album', error: err.message });
  }
}

const generateAccessCode = require('../utils/generateAccessCode');

// @route POST /api/albums/:id/share
// Generates (or regenerates) an access code for an album
async function generateShareCode(req, res) {
  try {
    const existing = await prisma.album.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Album not found' });
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let code;
    let isUnique = false;

    // ensure no collision with an existing code
    while (!isUnique) {
      code = generateAccessCode();
      const clash = await prisma.album.findUnique({ where: { accessCode: code } });
      if (!clash) isUnique = true;
    }

    const album = await prisma.album.update({
      where: { id: req.params.id },
      data: { accessCode: code }
    });

    res.json({
      accessCode: album.accessCode,
      shareLink: `${process.env.CLIENT_URL}/shared/${album.accessCode}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate share code', error: err.message });
  }
}

// @route DELETE /api/albums/:id/share
// Revokes the access code (disables sharing)
async function revokeShareCode(req, res) {
  try {
    const existing = await prisma.album.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Album not found' });
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.album.update({
      where: { id: req.params.id },
      data: { accessCode: null }
    });

    res.json({ message: 'Sharing disabled for this album' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke share code', error: err.message });
  }
}

module.exports = {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  generateShareCode,
  revokeShareCode
};