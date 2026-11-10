import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';
import { SessionService } from './services/session.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  protected readonly title = signal('citagest-front');
  public currentYear: number = 0;
  public isShowPassword: boolean = false;
  public typeInputPassword: string = "password";
  public username: string = "";
  public password: string = "";
  public errorLoginStr: string = "";

  constructor(
    private readonly loginService: LoginService,
    private readonly router: Router,
    private readonly sessionService: SessionService,
    private readonly cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
  }

  login(event: Event): any {
    event.preventDefault();
    this.loginService.login({username: this.username, password: this.password}).subscribe({
      next: (response: any) => {
        this.sessionService.setUser(response);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.errorLoginStr = "";
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        //console.error('Error en login:', error);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.errorLoginStr = "Contraseña o usuario incorrecto";
      }
    });
  }

  showPassword(event: Event): any{
    event.preventDefault();
    this.isShowPassword = !this.isShowPassword;
    this.typeInputPassword = (this.isShowPassword) ? "text" : "password";
  }
}
