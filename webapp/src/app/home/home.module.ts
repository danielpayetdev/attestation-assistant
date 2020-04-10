import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LiensComponent, SelectionMotifDialogComponent } from './liens/liens.component';
import { CompteComponent } from './compte/compte.component';
import { HomeComponent } from './home.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AngularFireFunctionsModule, ORIGIN } from '@angular/fire/functions';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    CompteComponent,
    LiensComponent,
    HomeComponent,
    SelectionMotifDialogComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    AngularFireFunctionsModule,
    ClipboardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule
  ],
  providers: [
    { provide: ORIGIN, useValue: 'https://attestation-assistant.web.app' }
    // { provide: ORIGIN, useValue: 'http://localhost:5001' }
  ]
})
export class HomeModule { }
