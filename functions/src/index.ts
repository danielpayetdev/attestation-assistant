import * as admin from 'firebase-admin';
admin.initializeApp();

export {
    genererAttestationPublic,
    genererAttestationParEmail,
    getAttestation
} from './attestation/attestation';

export {
    generateApiKey
} from './compte/compte';