import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasApiKey = Boolean(firebaseConfig.apiKey);
const isBrowser = typeof window !== 'undefined';

let app: ReturnType<typeof initializeApp> | undefined;
if (hasApiKey) {
	try {
		// Initialize Firebase both on server and browser when config is present.
		app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
	} catch (e) {
		console.warn('Firebase initialization failed:', e);
	}
} else {
	console.warn(
		'NEXT_PUBLIC_FIREBASE_API_KEY not set; skipping Firebase init.'
	);
}

const db = app ? getFirestore(app) : undefined;
const storage = app ? getStorage(app) : undefined;
// Auth and Google provider should only be used in the browser environment
const auth = app && isBrowser ? getAuth(app) : undefined;
const googleProvider =
	isBrowser && typeof GoogleAuthProvider !== 'undefined'
		? new GoogleAuthProvider()
		: undefined;

export { db, storage, auth, googleProvider };
export const DATA_COLLECTION = 'geplano_data';
export const DATA_DOC_ID = 'site_content';
