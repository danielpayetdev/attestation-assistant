import { v4 as uuid } from 'uuid';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const generateApiKey = functions.https.onCall(async (data, context) => {
    const id = context.auth?.uid as string;
    const key = uuid();
    await admin.firestore().collection('apiKeys').doc(id).set({
        key: key
    });
    return key;
});