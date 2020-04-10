import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginControl: FormGroup;

  constructor(
    private fb: FormBuilder,
    public auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginControl = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submitForm(): void {
    this.auth.signInWithEmailAndPassword(
      this.loginControl.get('email').value,
      this.loginControl.get('password').value
    )
      .then(() => this.router.navigate(['/home']))
      .catch((e) => this.snackBar.open(e.toString()));
  }
}
