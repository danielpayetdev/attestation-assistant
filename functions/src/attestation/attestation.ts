import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';
import { Utilisateur } from '../bean/utilisateur';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as admin from 'firebase-admin';
import { Motif } from './motif';

const runtimeOpts: functions.RuntimeOptions = {
    timeoutSeconds: 540,
    memory: "2GB"
}

const URL_GENERATEUR_ATTESTATION = "https://media.interieur.gouv.fr/deplacement-covid-19/index.html"
const DOWNLOAD_DIR = os.tmpdir();
const ATTESTATION_FILENAME_BASE = "attestation";
const FILE_EXTENTION = ".pdf";
let FICHIER_NAME: string;
let ATTESTATION_FILE: string;

/**
 * Génère une attestation puis l'envoie par email
 */
export const genererAttestationParEmail = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    try {
        const userId = context.auth?.uid;
        if (userId) {
            const user = await getUser(userId);
            await generateAttestion(user, data.motif ?? user.motif);
            await sendMail(user.email, getPdf(), data.motif ?? user.motif);
            fs.unlinkSync(ATTESTATION_FILE);
            return { success: true }
        }
        throw new Error("user identifiant cannot retrive");
    } catch (e) {
        console.error(e.toString());
        throw e;
    }
});

/**
 * Génère une attestation puis retourne le pdf
 */
export const getAttestation = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    try {
        const userId = context.auth?.uid;
        if (userId) {
            const user = await getUser(userId);
            await generateAttestion(user, data.motif ?? user.motif);
            const attestationBuffer = fs.readFileSync(ATTESTATION_FILE);
            const attestation = attestationBuffer.toString('base64');
            fs.unlinkSync(ATTESTATION_FILE);
            return { attestation, fileName: FICHIER_NAME };
        }
        throw new Error("user identifiant cannot retrive");
    } catch (e) {
        console.error(e.toString());
        throw e;
    }
});

/**
 * Fonction public génère une attestation puis l'envoie par email
 */
export const genererAttestationPublic = functions.runWith(runtimeOpts).https.onRequest(async (request, response) => {
    let user;
    try {
        const userId = await validateToken(request, response);
        if (userId) {
            user = await getUser(userId);
            const motif = getMotif(request) ?? user.motif;
            await generateAttestion(user, motif);
            await sendMail(user.email, getPdf(), motif);
            fs.unlinkSync(ATTESTATION_FILE);
            response.sendStatus(200);
        }
    } catch (e) {
        console.error(e.toString());
        if (user) {
            try {
                await sendErrorMail(user.email, e.message.toString());
            } catch (e) {
                console.error(e.toString());
            }
        }
        response.status(500).send(e.toString());
    }
});

const generateAttestion = async (user: Utilisateur, motif: string) => {
    const browser = await getBrowser();
    try {
        const page: puppeteer.Page = await browser.newPage();
        await page.goto(URL_GENERATEUR_ATTESTATION, { waitUntil: 'networkidle2' });
        await remplirFormulaire(page, user, motif);
        await telecharger(page);
    } catch (error) {
        console.log(error.toString())
        throw new Error("Impossible de génerer l'attestation.")
    }
    await browser.close();
};

const getBrowser = async () => {
    return await puppeteer.launch({
        args: ['--no-sandbox'],
        env: {
            TZ: 'Europe/Paris',
        }
    });
};

const remplirFormulaire = async (page: puppeteer.Page, user: Utilisateur, motif: string) => {

    await remplir(page, 'field-firstname', user.prenom);
    await remplir(page, 'field-lastname', user.nom);
    await remplir(page, 'field-birthday', user.dateNaissance.replace('/', ''));
    await remplir(page, 'field-lieunaissance', user.lieuNaissance);
    await remplir(page, 'field-address', user.adresse);
    await remplir(page, 'field-town', user.ville);
    await remplir(page, 'field-zipcode', user.codePostal);
    await page.click(`.form-check #checkbox-${motif}`);
};

const getMotif = (request: functions.https.Request) => {
    const motif = request.query.motif;
    if (motif) {
        return Motif.of(motif);
    }
    return undefined;
};

const remplir = async (page: puppeteer.Page, id: string, valeur: string) => {
    await page.focus(`#${id}`)
    await page.keyboard.type(valeur);
};

const telecharger = async (page: puppeteer.Page) => {
    await (page as any)._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_DIR });
    await page.click("#generate-btn");
    setfileName();
    await page.waitFor(1000);
    console.log('PDF téléchargé dans', ATTESTATION_FILE);
};

const setfileName = () => {
    FICHIER_NAME = `${ATTESTATION_FILENAME_BASE}-${getDate()}${FILE_EXTENTION}`;
    ATTESTATION_FILE = path.join(DOWNLOAD_DIR, FICHIER_NAME);
}

const getDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${formatDeuxDigit(now.getMonth() + 1)}-${formatDeuxDigit(now.getDate())}_${formatDeuxDigit(getHour(now))}-${formatDeuxDigit(now.getMinutes())}`;
}

const formatDeuxDigit = (date: number) => {
    return `${date <= 9 ? '0' : ''}${date}`;
}

/**
 * Force timezone Paris
 * @param date 
 */
const getHour = (date: Date) => {
    if (date.getHours() < 22) {
        return date.getHours() + 2;
    } else {
        return (date.getHours() + 2) - 24;
    }
}

const getPdf = () => {
    return fs.readFileSync(ATTESTATION_FILE);
}

const getUser: (userId: string) => Promise<Utilisateur> = async (userId) => {
    const query = await admin.firestore().collection('users').doc(userId).get();
    return query.data() as Utilisateur;
};

const validateToken = async (request: functions.https.Request, response: functions.Response) => {
    const apiKey = request.query.api_key;
    try {
        const ref = admin.firestore().collection('apiKeys').where("key", "==", apiKey);
        return ((await ref.get()).docs)[0].id;
    } catch (e) {
        response.status(401).send(e.toString());
        return undefined;
    }
};

const sendMail = async (email: string, pdf: Buffer, motif: string) => {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
        from: '"Attestation Covid-19" <attestation-covid19@danielpayet.dev>',
        to: email,
        subject: "Votre attestation de sortie avec le motif : " + motif,
        text: "Bonjour, votre attestation de sortie se trouve en pièce jointe. Bonne journée. #RestezChezVous",
        html: "Bonjour, <br>Votre attestation de sortie se trouve en pièce jointe.<br><br>Bonne journée,<br>#RestezChezVous",
        attachments: [{
            filename: FICHIER_NAME,
            content: pdf,
            contentType: 'application/pdf'
        }],
    });
    console.log("Message sent: %s", info.messageId);
};

const sendErrorMail = async (email: string, erreur: string) => {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
        from: '"Attestation Covid-19" <attestation-covid19@danielpayet.dev>',
        to: email,
        subject: "Erreur lors de la génération de votre attestation de sortie",
        text:
            `Bonjour, une erreur c'est produite lors de la génération de votre attestation.
Merci de réessayer plus tard ou de la faire sur le site officiel du gouvernement
Bonne journée,
#RestezChezVous`,
        html:
            `Bonjour,<br>
Une erreur c'est produite lors de la génération de votre attestation.<br>
Merci de réessayer plus tard ou de la faire sur le <a href="${URL_GENERATEUR_ATTESTATION}">site officiel du gouvernement</a><br>
<br>
Bonne journée,<br>
#RestezChezVous<br><br><br>
Détails de l'erreur:<br>${erreur}`,
    });
    console.log("Error message sent: %s", info.messageId);
};

const getTransporter = () => {
    return nodemailer.createTransport({
        host: functions.config().smtp.host,
        port: +functions.config().smtp.port,
        secure: functions.config().smtp.secure === "true",
        auth: {
            user: functions.config().smtp.login.email,
            pass: functions.config().smtp.login.password
        }
    });
};