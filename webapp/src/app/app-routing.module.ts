import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/non-connecte']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['/home']);

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'non-connecte',
    loadChildren: () => import('./non-connecte/non-connecte.module').then(m => m.NonConnecteModule),
    ...canActivate(redirectLoggedInToItems)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
