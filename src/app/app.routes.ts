import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login';
import { DashboardComponent } from './component/dashboard/dashboard';
import { authGuard } from './component/login/guards/auth-guard';
import { guestGuard } from './component/login/guards/guest-guard';
import { TemplateDateComponent } from './component/template-date/template-date';
import { CalendarComponent } from './component/calendar/calendar';
import { DatesClientComponent } from './component/dates-client/dates-client';
import { TurnComponent } from './component/turn/turn';
import { ScreenComponent } from './component/screen/screen';

export const routes: Routes = [
    { path: '', component: LoginComponent, canActivate: [guestGuard] },
    { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [authGuard],
        children: [
            { path: '', component: CalendarComponent, canActivate: [authGuard] },
            { path: 'template', component: TemplateDateComponent, canActivate: [authGuard] },
            { path: 'turn', component: TurnComponent, canActivate: [authGuard] }
        ]
    },
    { path: 'get-date', component: DatesClientComponent },
    { path: 'screen', component: ScreenComponent },
    
];
