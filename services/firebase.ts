import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// --- CONFIGURAÇÃO DO FIREBASE ---
// As credenciais já foram configuradas anteriormente pelo usuário.
const firebaseConfig = {
  apiKey: "AIzaSyDBYqOkGe_dnQCW1xfId_Ib_LA7jIlQmnY",
  authDomain: "geplano-site.firebaseapp.com",
  projectId: "geplano-site",
  storageBucket: "geplano-site.firebasestorage.app",
  messagingSenderId: "787147349642",
  appId: "1:787147349642:web:3cf02d164fb30e49a25773",
  measurementId: "G-JTC58MDK5Y"
};

// Variáveis de controle
let db: any = null;
let storage: any = null;
let auth: any = null;
let googleProvider: any = null; // Provider do Google
let isFirebaseInitialized = false;

try {
  if ((firebaseConfig as any).apiKey) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize Auth using named imports
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    isFirebaseInitialized = true;
    console.log("Firebase (DB, Auth, Google) inicializado com sucesso.");
  } else {
    console.log("Firebase não configurado. Usando LocalStorage.");
  }
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
}

export { db, storage, auth, googleProvider, isFirebaseInitialized };
export const DATA_DOC_ID = 'site_content';
export const DATA_COLLECTION = 'geplano_data';