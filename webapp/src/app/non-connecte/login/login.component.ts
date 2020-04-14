import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { MOTIF } from 'src/app/home/bean/motif';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginControl: FormGroup;
  public isLogin = true;
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
    private fb: FormBuilder,
    public auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router,
    private dataBase: AngularFirestore,
    private functions: AngularFireFunctions,
  ) { }

  ngOnInit(): void {
    this.loginControl = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submitForm(): void {
    if (this.isLogin) {
      this.auth.signInWithEmailAndPassword(
        this.loginControl.get('email').value,
        this.loginControl.get('password').value
      )
        .then(() => this.router.navigate(['/home']))
        .catch((e) => this.snackBar.open(e.toString(), 'Ok'));
    } else {
      this.auth.createUserWithEmailAndPassword(
        this.loginControl.get('email').value,
        this.loginControl.get('password').value
      ).then((user) => {
        return this.dataBase.collection('users').doc(user.user.uid).set({
          email: this.loginControl.get('email').value,
          prenom: this.loginControl.get('prenom').value,
          nom: this.loginControl.get('nom').value,
          dateNaissance: this.loginControl.get('dateNaissance').value,
          lieuNaissance: this.loginControl.get('lieuNaissance').value,
          adresse: this.loginControl.get('adresse').value,
          ville: this.loginControl.get('ville').value,
          codePostal: this.loginControl.get('codePostal').value.toString(),
          motif: this.loginControl.get('motif').value,
        });
      }
      )
        .then(() => this.router.navigate(['/home']))
        .catch((e) => this.snackBar.open(e.toString(), 'Ok'));
    }
  }

  enregistrement() {
    this.isLogin = false;
    this.loginControl.addControl('prenom', new FormControl('', Validators.required));
    this.loginControl.addControl('nom', new FormControl('', Validators.required));
    this.loginControl.addControl('dateNaissance', new FormControl('', Validators.required));
    this.loginControl.addControl('lieuNaissance', new FormControl('', Validators.required));
    this.loginControl.addControl('adresse', new FormControl('', Validators.required));
    this.loginControl.addControl('ville', new FormControl('', Validators.required));
    this.loginControl.addControl('codePostal', new FormControl('', Validators.required));
    this.loginControl.addControl('motif', new FormControl('', Validators.required));
  }

  annulerEnregistrement() {
    this.isLogin = true;
    this.loginControl.get('email').setValue('');
    this.loginControl.get('password').setValue('');
    this.loginControl.removeControl('prenom');
    this.loginControl.removeControl('nom');
    this.loginControl.removeControl('dateNaissance');
    this.loginControl.removeControl('lieuNaissance');
    this.loginControl.removeControl('adresse');
    this.loginControl.removeControl('ville');
    this.loginControl.removeControl('codePostal');
    this.loginControl.removeControl('motif');
  }
}
