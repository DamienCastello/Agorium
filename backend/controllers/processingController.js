const path = require('path')
const fs = require('fs')
const { Article, User } = require('../models')
const { videoQueue } = require('../services/videoQueue')

const isDev = process.env.NODE_ENV === 'development'
function toAbs(rel) {
  if (!rel) return null
  return isDev ? path.resolve(rel) : path.join('/app/public', rel)
}

module.exports = {
  getStatus: function (req, res, next) {
    Article.findByPk(req.params.id, {
      attributes: ['id', 'processingStatus', 'processingProgress', 'video', 'thumbnail']
    })
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: req.t('article.not_found') });
        }

        res.set('Cache-Control', 'no-store');

        res.status(200).json({
          id: article.id,
          status: article.processingStatus,
          progress: article.processingProgress,
          video: article.video,
          thumbnail: article.thumbnail,
        });
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: req.t('error') });
      });
  },
  retryProcessing: async function (req, res, next) {
    try {
      const articleId = req.params.id
      const userId = req.user?.id

      const article = await Article.findByPk(articleId)
      if (!article) return res.status(404).json({ message: 'Article not found' })

      // Authorization: owner or admin
      const isOwner = article.userId === userId
      const user = await User.findByPk(userId)
      const isAdmin = !!user?.isAdmin
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      // Only retry if failed
      if (article.processingStatus !== 'failed') {
        return res.status(409).json({ message: 'Cannot retry unless failed' })
      }

      // Need a valid original file
      const absInput = toAbs(article.originalVideo)
      if (!absInput || !fs.existsSync(absInput)) {
        return res.status(410).json({ message: 'Original file missing' })
      }

      // Reset status
      await article.update({
        processingStatus: 'queued',
        processingProgress: 0,
        processingError: null,
      })

      // Re-enqueue
      await videoQueue.add('process', { articleId: article.id, fullVideoPath: absInput })

      return res.status(202).json({ ok: true, id: article.id, status: 'queued' })
    } catch (err) {
      console.error('[retry] error:', err)
      return res.status(500).json({ message: 'Retry failed' })
    }
  },
};
