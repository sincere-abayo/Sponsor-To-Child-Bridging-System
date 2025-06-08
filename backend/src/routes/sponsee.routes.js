const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const sponseeController = require('../controllers/sponsee.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfirmationPhoto:
 *       type: object
 *       required:
 *         - sponsorship_id
 *         - photo
 *       properties:
 *         sponsorship_id:
 *           type: integer
 *           description: ID of the sponsorship
 *         photo:
 *           type: string
 *           format: binary
 *           description: Photo file
 *     SponseeMessage:
 *       type: object
 *       required:
 *         - sponsor_id
 *         - content
 *       properties:
 *         sponsor_id:
 *           type: integer
 *           description: ID of the sponsor to reply to
 *         content:
 *           type: string
 *           description: Message content
 */

/**
 * @swagger
 * /api/sponsees/profile:
 *   get:
 *     summary: Get sponsee profile
 *     tags: [Sponsees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsee profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, authorizeRoles('sponsee'), sponseeController.getProfile);

/**
 * @swagger
 * /api/sponsees/sponsorships:
 *   get:
 *     summary: Get received sponsorships
 *     tags: [Sponsees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsorships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   sponsor_id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/sponsorships', authenticate, authorizeRoles('sponsee'), sponseeController.getSponsorships);

/**
 * @swagger
 * /api/sponsees/confirm:
 *   post:
 *     summary: Upload confirmation photo
 *     tags: [Sponsees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmationPhoto'
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/confirm', authenticate, authorizeRoles('sponsee'), sponseeController.uploadConfirmation);

// Get messages from a specific sponsor
router.get('/messages/:sponsor_id', authenticate, authorizeRoles('sponsee'), sponseeController.getMessages);

/**
 * @swagger
 * /api/sponsees/reply:
 *   post:
 *     summary: Reply to sponsor message
 *     tags: [Sponsees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SponseeMessage'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/reply', authenticate, authorizeRoles('sponsee'), sponseeController.replyToMessage);

module.exports = router; 