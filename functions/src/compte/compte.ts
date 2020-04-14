import uuidAPIKey from 'uuid-apikey';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const generateApiKey = functions.https.onCall(async (data, context) => {
    const id = context.auth?.uid as string;
    const key = uuidAPIKey.create().apiKey
    await admin.firestore().collection('apiKeys').doc(id).set({
        key: uuidAPIKey.create().apiKey
    });
    return key;
});