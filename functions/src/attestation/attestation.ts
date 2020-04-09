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
const ATTESTATION_FILENAME = "attestation.pdf"
const ATTESTATION_FILE = path.join(DOWNLOAD_DIR, ATTESTATION_FILENAME);

export const generateAttestation = functions.runWith(runtimeOpts).https.onRequest(async (request, response) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        env: {
            TZ: 'Europe/Paris',
        }
    });

    let user;
    try {
        const page: puppeteer.Page = await browser.newPage();
        await page.goto(URL_GENERATEUR_ATTESTATION, { waitUntil: 'networkidle2' });
        const userId = await getUserIdFromApiKey(request);
        user = await getUser(userId);
        const motif = getMotif(request) ?? user.motif;
        await remplirFormulaire(page, user, motif);
        await telecharger(page);
        await sendMail(user.email, getPdf(), motif);
        fs.unlinkSync(ATTESTATION_FILE);
        response.sendStatus(200);
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
    await browser.close();
});

const remplirFormulaire = async (page: puppeteer.Page, user: Utilisateur, motif: string) => {

    await remplir(page, 'field-firstnameeeeeee', user.prenom);
    await remplir(page, 'field-lastname', user.nom);
    await remplir(page, 'field-birthday', user.dateNaissance);
    await remplir(page, 'field-lieunaissance', user.lieuNaissance);
    await remplir(page, 'field-address', user.adresse);
    await remplir(page, 'field-town', user.ville);
    await remplir(page, 'field-zipcode', user.codePostal);
    await page.click(`.form-check #checkbox-${motif}`);
}

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
}

const telecharger = async (page: puppeteer.Page) => {
    await (page as any)._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_DIR });
    await page.click("#generate-btn");
    await page.waitFor(4000);
    console.log('PDF téléchargé dans', ATTESTATION_FILE);
}

const getPdf = () => {
    return fs.readFileSync(ATTESTATION_FILE);
}

const getUser: (userId: string) => Promise<Utilisateur> = async (userId) => {
    const query = await admin.firestore().collection('users').doc(userId).get();
    return query.data() as Utilisateur;
};

const getUserIdFromApiKey = async (request: functions.https.Request) => {
    const apiKey = request.query.api_key;
    if (apiKey === undefined || apiKey === "") {
        throw new Error("No api key");
    }
    const query = await admin.firestore().collection('apiKeys').where("key", "==", apiKey).get();
    if (query.empty) {
        throw new Error("No api key exist");
    }
    if (query.size !== 1) {
        throw new Error("Multiple instance of api key exist, please contact support");
    }
    return query.docs[0].data().user;
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
            filename: 'attestation.pdf',
            content: pdf,
            contentType: 'application/pdf'
        }],
    });
    console.log("Message sent: %s", info.messageId);
}

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
}

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
}