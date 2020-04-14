import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Utilisateur } from '../bean/utilisateur';
import { MOTIF } from '../bean/motif';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrls: ['./compte.component.scss']
})
export class CompteComponent implements OnInit {
  public compteControl: FormGroup = this.initForm();
  public motifs = [
    { label: MOTIF.TRAVAIL, texte: MOTIF.TRAVAIL },
    { label: MOTIF.COURSES, texte: MOTIF.COURSES },
    { label: MOTIF.SANTE, texte: MOTIF.SANTE },
    { label: MOTIF.SPORT, texte: MOTIF.SPORT },
    { label: MOTIF.FAMILLE, texte: MOTIF.FAMILLE },
    { label: MOTIF.JUDICIAIRE, texte: MOTIF.JUDICIAIRE },
    { label: MOTIF.MISIONS, texte: MOTIF.MISIONS }
  ];

  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private fb: FormBuilder,
    private dataBase: AngularFirestore,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    const userId = (await this.auth.currentUser).uid;
    this.dataBase.collection('users').doc(userId).valueChanges().subscribe((utilisateur: Utilisateur) => {
      this.buildForm(utilisateur);
    });
  }

  public async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/non-connecte']);
  }

  public async submitForm(): Promise<void> {
    const userId = (await this.auth.currentUser).uid;
    this.dataBase.collection('users').doc(userId).update({
      prenom: this.compteControl.get('prenom').value,
      nom: this.compteControl.get('nom').value,
      dateNaissance: this.compteControl.get('dateNaissance').value,
      lieuNaissance: this.compteControl.get('lieuNaissance').value,
      adresse: this.compteControl.get('adresse').value,
      ville: this.compteControl.get('ville').value,
      codePostal: this.compteControl.get('codePostal').value.toString(),
      motif: this.compteControl.get('motif').value,
    });
  }

  private initForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: ['', Validators.required],
      motif: ['', Validators.required],
    });
  }

  private buildForm(utilisateur: Utilisateur) {
    this.compteControl.get('email').setValue(utilisateur.email);
    this.compteControl.get('prenom').setValue(utilisateur.prenom);
    this.compteControl.get('nom').setValue(utilisateur.nom);
    this.compteControl.get('dateNaissance').setValue(utilisateur.dateNaissance);
    this.compteControl.get('lieuNaissance').setValue(utilisateur.lieuNaissance);
    this.compteControl.get('adresse').setValue(utilisateur.adresse);
    this.compteControl.get('ville').setValue(utilisateur.ville);
    this.compteControl.get('codePostal').setValue(utilisateur.codePostal);
    this.compteControl.get('motif').setValue(utilisateur.motif);
  }

  public supprimerCompte() {
    const ref = this.dialog.open(ConfirmationSuppressionDialogComponent);
    ref.afterClosed().subscribe(async (password: string | undefined) => {
      if (password) {
        const user = (await this.auth.currentUser);
        await this.auth.signInWithEmailAndPassword(user.email, password);
        await this.router.navigate(['/non-connecte']);
        await this.dataBase.collection('users').doc(user.uid).delete();
        await user.delete();
      }
    });
  }
}

@Component({
  selector: 'app-confirmation-suppression-dialog',
  template: `
    <div mat-dialog-content>
      <p>Etes vous sûr de vouloir supprimer votre compte ? Aucunes données n'est conservées.</p>
      <p>Si oui, entrez votre mot de passe</p>
      <mat-form-field appearance="standard">
        <mat-label>Mot de passe</mat-label>
      <input type="password" #password  matInput>
    </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="undefined" cdkFocusInitial>Non</button>
      <button mat-button [mat-dialog-close]="password.value">Oui</button>
    </div>
  `,
})
export class ConfirmationSuppressionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationSuppressionDialogComponent>, ) { }
}
