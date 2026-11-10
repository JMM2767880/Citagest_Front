import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LanguageStateService {
  private readonly currentLanguageSubject = new BehaviorSubject<string>(environment.defaultLanguage);
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  get currentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: string): void {
    this.currentLanguageSubject.next(lang);
  }
}