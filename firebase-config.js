// ══════════════════════════════════════════════════════════════
//  CODE HEIST — Firebase Configuration & Helper Functions
// ══════════════════════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdCmakLtIouFT7cSuL3mR4eXRgZ8TqZx0",
  authDomain: "code-heist-559a1.firebaseapp.com",
  projectId: "code-heist-559a1",
  storageBucket: "code-heist-559a1.firebasestorage.app",
  messagingSenderId: "886009394865",
  appId: "1:886009394865:web:de18e9e86e599a891b5490",
  measurementId: "G-B73S67VV0X"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Helpers ────────────────────────────────────────────────
export { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp };

/** Save team's edited code. */
export async function saveTeamEditedCode(teamId, levelNum, editedCode) {
  const field = `progress.level${levelNum}.editedCode`;
  await updateDoc(doc(db, 'teams', teamId), { [field]: editedCode });
}

/** Generate a unique 5-char uppercase alphanumeric access code */
export async function generateUniqueAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  while (true) {
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    // Check uniqueness in Firestore
    const q = query(collection(db, 'teams'), where('accessCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return code;
  }
}

/** Suggest alternate team names if name taken */
export async function suggestAlternateTeamName(baseName) {
  for (let i = 2; i <= 10; i++) {
    const candidate = `${baseName}-${i}`;
    const q = query(collection(db, 'teams'), where('teamName', '==', candidate));
    const snap = await getDocs(q);
    if (snap.empty) return candidate;
  }
  return `${baseName}-${Date.now()}`;
}

/** Check if team name already exists. Returns true if taken. */
export async function teamNameExists(name) {
  const q = query(collection(db, 'teams'), where('teamName', '==', name));
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Save team registration to Firestore */
export async function registerTeam(teamData) {
  const docRef = await addDoc(collection(db, 'teams'), {
    ...teamData,
    currentLevel: 1,
    levelConfig: {},
    progress: {},
    registeredAt: serverTimestamp()
  });
  return docRef.id;
}

/** Login: find team by teamName + accessCode */
export async function loginTeam(teamName, accessCode) {
  const q = query(
    collection(db, 'teams'),
    where('teamName', '==', teamName),
    where('accessCode', '==', accessCode.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docData = snap.docs[0];
  return { id: docData.id, ...docData.data() };
}

/** Get a single team by ID */
export async function getTeam(teamId) {
  const snap = await getDoc(doc(db, 'teams', teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Update team's current level */
export async function setTeamLevel(teamId, level) {
  await updateDoc(doc(db, 'teams', teamId), { currentLevel: level });
}

/** Save admin-configured level data for a team */
export async function saveTeamLevelConfig(teamId, levelNum, config) {
  const field = `levelConfig.${levelNum}`;
  await updateDoc(doc(db, 'teams', teamId), { [field]: config });
}

// ─── Pre-configured Slots ──────────────────────────────────

/** Get all pre-configured slots ordered by slot number/order */
export async function getAllSlots() {
  const snap = await getDocs(query(collection(db, 'preconfigured_slots'), orderBy('order', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Create a new pre-configured slot */
export async function createSlot(slotName, order) {
  const docRef = await addDoc(collection(db, 'preconfigured_slots'), {
    slotName,
    order,
    levelConfig: {},
    isAssigned: false,
    assignedTeamId: null,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/** Save level config for a slot */
export async function saveSlotLevelConfig(slotId, levelNum, config) {
  const field = `levelConfig.${levelNum}`;
  await updateDoc(doc(db, 'preconfigured_slots', slotId), { [field]: config });
}

/** Delete a slot */
export async function deleteSlot(slotId) {
  await deleteDoc(doc(db, 'preconfigured_slots', slotId));
}

/** Get the next available slot for registration */
export async function getNextAvailableSlot() {
  const q = query(
    collection(db, 'preconfigured_slots'),
    where('isAssigned', '==', false),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docData = snap.docs[0];
  return { id: docData.id, ...docData.data() };
}

/** Mark a slot as assigned to a team */
export async function markSlotAsAssigned(slotId, teamId) {
  await updateDoc(doc(db, 'preconfigured_slots', slotId), {
    isAssigned: true,
    assignedTeamId: teamId,
    assignedAt: serverTimestamp()
  });
}

/** Get all teams (for admin) */
export async function getAllTeams() {
  const snap = await getDocs(query(collection(db, 'teams'), orderBy('registeredAt', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Record level completion timestamp */
export async function recordLevelCompletion(teamId, levelNum) {
  const field = `progress.level${levelNum}.completedAt`;
  await updateDoc(doc(db, 'teams', teamId), {
    [field]: serverTimestamp(),
    currentLevel: levelNum + 1
  });
}

/** Record clue letter submission */
export async function recordClueEntry(teamId, levelNum, enteredClue) {
  const field = `progress.level${levelNum}.clueEnteredAt`;
  await updateDoc(doc(db, 'teams', teamId), {
    [field]: serverTimestamp(),
    [`progress.level${levelNum}.clueEntered`]: enteredClue
  });
}
