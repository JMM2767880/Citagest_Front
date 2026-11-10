import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoginService } from '../login/services/login.service';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../login/services/session.service';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { LanguageStateService } from '../../services/language-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  public userLogged: any;
  public languages: any[] = [];
  public selectedLanguage: string = '';

  constructor(
    private readonly loginService: LoginService,
    private readonly sessionService: SessionService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
    private readonly languageStateService: LanguageStateService,
    private readonly cdr: ChangeDetectorRef,
  ){}

  ngOnInit(): void {
    this.userLogged = this.sessionService.currentUser;
    this.selectedLanguage = this.languageStateService.currentLanguage;
    this.languageService.getLanguages().subscribe({
      next: (response: any) => {
        this.languages = response;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  closeSession(): any{
    this.loginService.logout().subscribe({
      next: (response: any) => {
        this.sessionService.clear();
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  selectLanguage(event: Event, lang: any): void{
    event.preventDefault();
    this.languageStateService.setLanguage(lang);
    this.selectedLanguage = lang;
    this.cdr.detectChanges();
  }
}
