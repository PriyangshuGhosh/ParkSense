import initFirebaseAdmin from "../firebaseAdmin.js";
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";

// ----------------------------------------------------------------------
// 🔹 FIREBASE + FILESTORE HYBRID SETUP
// ----------------------------------------------------------------------
let adminInstance = null;
let dbInstance = null;

function getAdmin() {
  if (!adminInstance) {
    try {
      adminInstance = initFirebaseAdmin();
    } catch (e) {
      console.warn("⚠️ Firebase Admin initialization failed — running in FileStore mode.");
      adminInstance = null;
    }
  }
  return adminInstance;
}

function getDb() {
  const admin = getAdmin();
  if (admin && !dbInstance) dbInstance = admin.app().firestore();
  return dbInstance;
}

// Firestore structure helper — matches your Firestore layout
const APP_ID = "default-app-id";
function getFirestoreRefs(db) {
  const root = db
    .collection("artifacts")
    .doc(APP_ID)
    .collection("public")
    .doc("data");

  return {
    spots: root.collection("parking_spots"),
    bookings: root.collection("user_bookings"),
  };
}

// Local fallback
const FILE_STORE = path.resolve("./data/spots.json");
const FILE_BOOKINGS = path.resolve("./data/bookings.json");

const INITIAL_SPOTS = [
  { id: "ict", name: "ICT Block", count: 12, status: "available" },
  { id: "gimsr", name: "GIMSR Block", count: 5, status: "available" },
  { id: "cb", name: "Central Block", count: 2, status: "available" },
  { id: "vb", name: "VB Block", count: 8, status: "available" },
  { id: "krc", name: "KRC Block", count: 0, status: "unavailable" },
];

function ensureFileStore() {
  const dir = path.dirname(FILE_STORE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE_STORE))
    fs.writeFileSync(FILE_STORE, JSON.stringify(INITIAL_SPOTS, null, 2));
}

function ensureFileStoreBookings() {
  const dir = path.dirname(FILE_BOOKINGS);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE_BOOKINGS))
    fs.writeFileSync(FILE_BOOKINGS, JSON.stringify({}, null, 2));
}

function findSpotIndex(arr, id) {
  return arr.findIndex((d) => d.id === id);
}

// ----------------------------------------------------------------------
// 1️⃣ LIST SPOTS
// ----------------------------------------------------------------------
export async function listSpots(req, res) {
  const db = getDb();
  try {
    if (db) {
      const { spots } = getFirestoreRefs(db);
      const snapshot = await spots.get();
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(`[LIST] Retrieved ${data.length} parking spots from Firestore.`);
      return res.json({ data });
    } else {
      ensureFileStore();
      const data = JSON.parse(fs.readFileSync(FILE_STORE, "utf8"));
      const displayData = data.filter((s) => s.count > 0 || s.status === "available");
      console.log(`[LIST] Retrieved ${displayData.length} parking spots from FileStore.`);
      return res.json({ data: displayData });
    }
  } catch (err) {
    console.error("❌ List Spots Error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Unable to list spots." });
  }
}

// ----------------------------------------------------------------------
// 2️⃣ BOOK A SPOT
// ----------------------------------------------------------------------
export async function bookSpot(req, res) {
  const db = getDb();
  const admin = getAdmin();
  const userEmail = req.user?.email;
  const { spotId, name, vehicle, payment } = req.body;

  if (!userEmail) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not authenticated." });
  if (!spotId) return res.status(StatusCodes.BAD_REQUEST).json({ error: "spotId is required." });

  const blockId = spotId.split("-")[0];
  const BOOKING_DURATION_MS = 24 * 60 * 60 * 1000;
  const expiryTime = Date.now() + BOOKING_DURATION_MS;

  const bookingDetails = {
    spotId,
    blockId,
    userEmail,
    userName: name,
    vehicle,
    payment,
    bookedAt: new Date().toISOString(),
    expiryTime: new Date(expiryTime).toISOString(),
  };

  try {
    if (db && admin) {
      const { spots, bookings } = getFirestoreRefs(db);
      const blockRef = spots.doc(blockId);
      const userBookingRef = bookings.doc(userEmail);

      console.log(`[BOOK] Firestore transaction started for user: ${userEmail}`);

      await db.runTransaction(async (transaction) => {
        const blockDoc = await transaction.get(blockRef);
        const userBookingDoc = await transaction.get(userBookingRef);

        if (!blockDoc.exists) throw new Error(`Spot block ${blockId} not found.`);
        if (userBookingDoc.exists) throw new Error(`User ${userEmail} already has a spot reserved.`);

        const currentCount = blockDoc.data().count;
        if (currentCount <= 0) throw new Error(`Spot block ${blockId} unavailable.`);

        transaction.update(blockRef, { count: admin.firestore.FieldValue.increment(-1) });
        transaction.set(userBookingRef, bookingDetails);
      });

      console.log(`[BOOK ✅] ${userEmail} booked ${spotId}`);
      return res.status(StatusCodes.CREATED).json({ message: `Spot ${spotId} booked.`, booking: bookingDetails });
    } else {
      ensureFileStore();
      ensureFileStoreBookings();

      const spotsArr = JSON.parse(fs.readFileSync(FILE_STORE, "utf8"));
      const bookingsMap = JSON.parse(fs.readFileSync(FILE_BOOKINGS, "utf8"));

      if (bookingsMap[userEmail]) throw new Error(`User ${userEmail} already has a spot reserved.`);

      const spotIndex = findSpotIndex(spotsArr, blockId);
      if (spotIndex === -1) throw new Error(`Spot block ${blockId} not found.`);
      const spot = spotsArr[spotIndex];
      if (spot.count <= 0) throw new Error(`Spot block ${blockId} unavailable.`);

      spot.count -= 1;
      bookingsMap[userEmail] = bookingDetails;

      fs.writeFileSync(FILE_STORE, JSON.stringify(spotsArr, null, 2));
      fs.writeFileSync(FILE_BOOKINGS, JSON.stringify(bookingsMap, null, 2));

      console.log(`[BOOK ✅] ${userEmail} booked ${spotId} (FileStore Mode)`);
      return res.status(StatusCodes.CREATED).json({ message: `Spot ${spotId} booked.`, booking: bookingDetails });
    }
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    let code = StatusCodes.INTERNAL_SERVER_ERROR;
    if (err.message.includes("already")) code = StatusCodes.CONFLICT;
    else if (err.message.includes("not found")) code = StatusCodes.NOT_FOUND;
    else if (err.message.includes("unavailable")) code = StatusCodes.FORBIDDEN;
    return res.status(code).json({ error: err.message });
  }
}

// ----------------------------------------------------------------------
// 3️⃣ GET USER’S CURRENT SPOT
// ----------------------------------------------------------------------
export async function getUsersCurrentSpot(req, res) {
  const db = getDb();
  const userEmail = req.user?.email;
  if (!userEmail) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not authenticated." });

  try {
    if (db) {
      const { bookings } = getFirestoreRefs(db);
      const doc = await bookings.doc(userEmail).get();
      console.log(`[GET CURRENT] ${userEmail} => ${doc.exists ? "found booking" : "no active booking"}`);
      return res.json({ booking: doc.exists ? doc.data() : null });
    } else {
      ensureFileStoreBookings();
      const bookingsMap = JSON.parse(fs.readFileSync(FILE_BOOKINGS, "utf8"));
      console.log(`[GET CURRENT] ${userEmail} (FileStore) => ${bookingsMap[userEmail] ? "found" : "none"}`);
      return res.json({ booking: bookingsMap[userEmail] || null });
    }
  } catch (err) {
    console.error("❌ Get Current Spot Error:", err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Unable to fetch current spot." });
  }
}

// ----------------------------------------------------------------------
// 4️⃣ MANAGE SPOT — EXTEND / ABANDON
// ----------------------------------------------------------------------
export async function manageUserSpot(req, res) {
  const db = getDb();
  const admin = getAdmin();
  const userEmail = req.user?.email;
  const { action } = req.body;

  if (!userEmail) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not authenticated." });
  if (!["extend", "abandon"].includes(action))
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid action. Use 'extend' or 'abandon'." });

  console.log(`[MANAGE] Request received for ${userEmail} | Action: ${action}`);

  try {
    if (db && admin) {
      const { spots, bookings } = getFirestoreRefs(db);
      const userBookingRef = bookings.doc(userEmail);

      const result = await db.runTransaction(async (transaction) => {
        const bookingSnap = await transaction.get(userBookingRef);
        if (!bookingSnap.exists) throw new Error(`No active spot found for user ${userEmail}.`);

        const booking = bookingSnap.data();
        const blockRef = spots.doc(booking.blockId);

        if (action === "abandon") {
          transaction.update(blockRef, { count: admin.firestore.FieldValue.increment(1) });
          transaction.delete(userBookingRef);
          console.log(`[ABANDON ✅] ${userEmail} abandoned ${booking.spotId}`);
          return { message: "Spot successfully abandoned.", newBooking: null };
        }

        if (action === "extend") {
          const EXTEND_MS = 24 * 60 * 60 * 1000;
          const currentExpiry = new Date(booking.expiryTime).getTime();
          const newExpiry = new Date(currentExpiry + EXTEND_MS).toISOString();

          transaction.update(userBookingRef, {
            expiryTime: newExpiry,
            updatedAt: new Date().toISOString(),
          });
          console.log(`[EXTEND ✅] ${userEmail} extended ${booking.spotId} to ${newExpiry}`);
          return { message: "Spot extended successfully for 24 hours.", newBooking: { ...booking, expiryTime: newExpiry } };
        }
      });

      console.log(`[MANAGE ✅] Action completed for ${userEmail}`);
      return res.status(StatusCodes.OK).json(result);
    }

    // ---------------- FILESTORE MODE ----------------
    ensureFileStore();
    ensureFileStoreBookings();

    const spotsArr = JSON.parse(fs.readFileSync(FILE_STORE, "utf8"));
    const bookingsMap = JSON.parse(fs.readFileSync(FILE_BOOKINGS, "utf8"));
    const booking = bookingsMap[userEmail];

    if (!booking) throw new Error(`No active spot found for user ${userEmail}.`);

    const spotIndex = findSpotIndex(spotsArr, booking.blockId);
    const spot = spotsArr[spotIndex];

    if (action === "abandon") {
      if (spot) {
        spot.count += 1;
        fs.writeFileSync(FILE_STORE, JSON.stringify(spotsArr, null, 2));
      }
      delete bookingsMap[userEmail];
      fs.writeFileSync(FILE_BOOKINGS, JSON.stringify(bookingsMap, null, 2));
      console.log(`[ABANDON ✅ FileStore] ${userEmail} abandoned ${booking.spotId}`);
      return res.json({ message: "Spot successfully abandoned.", newBooking: null });
    }

    if (action === "extend") {
      const EXTEND_MS = 24 * 60 * 60 * 1000;
      const currentExpiry = new Date(booking.expiryTime).getTime();
      const newExpiry = new Date(currentExpiry + EXTEND_MS).toISOString();

      bookingsMap[userEmail].expiryTime = newExpiry;
      bookingsMap[userEmail].updatedAt = new Date().toISOString();
      fs.writeFileSync(FILE_BOOKINGS, JSON.stringify(bookingsMap, null, 2));

      console.log(`[EXTEND ✅ FileStore] ${userEmail} extended ${booking.spotId} to ${newExpiry}`);
      return res.json({ message: "Spot extended successfully for 24 hours.", newBooking: bookingsMap[userEmail] });
    }
  } catch (err) {
    console.error("❌ Manage Spot Error:", err.message);
    let code = StatusCodes.INTERNAL_SERVER_ERROR;
    if (err.message.includes("No active spot")) code = StatusCodes.NOT_FOUND;
    return res.status(code).json({ error: err.message });
  }
}
