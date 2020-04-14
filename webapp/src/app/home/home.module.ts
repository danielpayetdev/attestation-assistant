import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LiensComponent, SelectionMotifDialogComponent } from './liens/liens.component';
import { CompteComponent, ConfirmationSuppressionDialogComponent } from './compte/compte.component';
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
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    CompteComponent,
    LiensComponent,
    HomeComponent,
    SelectionMotifDialogComponent,
    ConfirmationSuppressionDialogComponent
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
    MatListModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  providers: [
    // {  provide: ORIGIN, useValue: 'http://localhost:5001' }
  ]
})
export class HomeModule { }
