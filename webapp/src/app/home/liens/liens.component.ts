import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireFunctions, ORIGIN } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MOTIF } from '../bean/motif';

const FONCTION_GENERER_PAR_EMAIL = 'genererAttestationParEmail';
const FONCTION_GENERER_ET_TELECHARGER = 'getAttestation';

@Component({
  selector: 'app-liens',
  templateUrl: './liens.component.html',
  styleUrls: ['./liens.component.scss']
})
export class LiensComponent implements OnInit {
  public urlApi: string;
  public emailIsGenerating = false;
  public attestationIsGenerating = false;

  constructor(
    private functions: AngularFireFunctions,
    private auth: AngularFireAuth,
    @Inject(ORIGIN) private origin: string,
    private clipboard: Clipboard,
    private snackbar: MatSnackBar,
    private bottomSheet: MatDialog
  ) { }

  ngOnInit(): void {
  }

  public getParEmail(): void {
    if (!this.emailIsGenerating) {
      this.emailIsGenerating = true;
      this.ouvrirSelectionMotif().subscribe((motif) => {
        if (motif) {
          this.functions.httpsCallable(FONCTION_GENERER_PAR_EMAIL)({ motif }).subscribe(
            () => {
              this.snackbar.open('Le mail à correctement était envoyé.', undefined, { duration: 3000 });
              this.emailIsGenerating = false;
            },
            (e) => {
              this.snackbar.open('Echec lors la génération du mail.' + e.toString(), undefined, { duration: 3000 });
              this.emailIsGenerating = false;
            }
          );
        } else {
          this.emailIsGenerating = false;
        }
      },
        () => this.emailIsGenerating = false
      );
    }
  }

  public getAttestation(): void {
    if (!this.attestationIsGenerating) {
      this.attestationIsGenerating = true;
      this.ouvrirSelectionMotif().subscribe((motif) => {
        if (motif) {
          this.functions.httpsCallable(FONCTION_GENERER_ET_TELECHARGER)({ motif }).subscribe(
            (data) => {
              saveAs(this.b64toBlob(data.attestation), data.fileName);
              this.snackbar.open('Le fichier est télécharger sur votre appareil', undefined, { duration: 3000 });
              this.attestationIsGenerating = false;
            },
            (e) => {
              this.snackbar.open('Echec lors la génération de l\'attestation' + e.toString(), undefined, { duration: 3000 });
              this.attestationIsGenerating = false;
            }
          );
        } else {
          this.attestationIsGenerating = false;
        }
      },
        () => this.attestationIsGenerating = false
      );
    }
  }

  private b64toBlob(dataURI) {
    const byteString = atob(dataURI);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'application/pdf' });
  }

  public async initApiUrl(): Promise<void> {
    const user: firebase.User = await this.auth.currentUser;
    const id = await user.getIdToken(true);
    this.urlApi = `${this.origin}/genererAttestation?api_key=${id}`;
    if (this.clipboard.copy(this.urlApi)) {
      this.snackbar.open(
        'L\'url à était copié dans le presse-papiers',
        undefined,
        { duration: 3000 }
      );
    }
  }

  private ouvrirSelectionMotif(): Observable<string> {
    const ref = this.bottomSheet.open(SelectionMotifDialogComponent);
    return ref.afterClosed();
  }
}



@Component({
  selector: 'app-select-motif',
  templateUrl: 'selection-motif.html',
})
export class SelectionMotifDialogComponent {
  public motif = MOTIF;

  constructor(private dialogRef: MatDialogRef<SelectionMotifDialogComponent>) { }

  choisirMotif(motif: MOTIF): void {
    this.dialogRef.close(motif);
  }
}
