import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiensComponent } from './liens/liens.component';
import { CompteComponent } from './compte/compte.component';
import { HomeComponent } from './home.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'lien', pathMatch: 'full' },
      { path: 'lien', component: LiensComponent },
      { path: 'compte', component: CompteComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
