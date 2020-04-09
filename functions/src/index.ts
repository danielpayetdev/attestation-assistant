import * as admin from 'firebase-admin';

admin.initializeApp();

export { generateAttestation } from './attestation/attestation';