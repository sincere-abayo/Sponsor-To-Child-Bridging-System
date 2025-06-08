const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const sponsorController = require('../controllers/sponsor.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sponsorship:
 *       type: object
 *       required:
 *         - sponsee_id
 *         - amount
 *       properties:
 *         sponsee_id:
 *           type: integer
 *           description: ID of the sponsee
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount to sponsor
 *     Message:
 *       type: object
 *       required:
 *         - sponsee_id
 *         - content
 *       properties:
 *         sponsee_id:
 *           type: integer
 *           description: ID of the sponsee to message
 *         content:
 *           type: string
 *           description: Message content
 */

/**
 * @swagger
 * /api/sponsors/profile:
 *   get:
 *     summary: Get sponsor profile
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsor profile retrieved successfully
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
router.get('/profile', authenticate, authorizeRoles('sponsor'), sponsorController.getProfile);

/**
 * @swagger
 * /api/sponsors/sponsorship:
 *   post:
 *     summary: Submit a new sponsorship
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sponsorship'
 *     responses:
 *       201:
 *         description: Sponsorship created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/sponsorship', authenticate, authorizeRoles('sponsor'), sponsorController.submitSponsorship);

/**
 * @swagger
 * /api/sponsors/history:
 *   get:
 *     summary: Get sponsorship history
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsorship history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   sponsee_id:
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
router.get('/history', authenticate, authorizeRoles('sponsor'), sponsorController.getSponsorshipHistory);

/**
 * @swagger
 * /api/sponsors/message:
 *   post:
 *     summary: Send message to sponsee
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/message', authenticate, authorizeRoles('sponsor'), sponsorController.sendMessage);

// Get messages with a specific sponsee
router.get('/messages/:sponsee_id', authenticate, authorizeRoles('sponsor'), sponsorController.getMessages);

module.exports = router; 