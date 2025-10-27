import express from "express";
import {
  listSpots,
  bookSpot,
  getUsersCurrentSpot,
  manageUserSpot,
} from "../controllers/spotsController.js";
import { verifyFirebaseIdToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/spots
 * @desc Get available parking spots.
 * @access Public
 */
router.get("/", listSpots);

/**
 * @route POST /api/spots/book
 * @desc Book a parking spot
 * @access Private
 */
router.post("/book", verifyFirebaseIdToken, bookSpot);

/**
 * @route GET /api/spots/my-spot
 * @desc Get user's current booking
 * @access Private
 */
router.get("/my-spot", verifyFirebaseIdToken, getUsersCurrentSpot);

/**
 * @route PUT /api/spots/manage
 * @desc Extend or Abandon current spot
 * @access Private
 */
router.put("/manage", verifyFirebaseIdToken, manageUserSpot);

export default router;
