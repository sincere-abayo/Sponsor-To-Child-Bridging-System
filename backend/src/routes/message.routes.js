const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const messageController = require('../controllers/message.controller');

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get conversation history
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/:userId', authenticate, messageController.getConversationHistory);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/translate:
 *   post:
 *     summary: Translate message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - targetLanguage
 *             properties:
 *               text:
 *                 type: string
 *               targetLanguage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message translated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/translate', authenticate, messageController.translateMessage);

module.exports = router; 