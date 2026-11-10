import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { filter, first } from 'rxjs';
import { TvTurnService } from './services/tv-turn.service';

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './screen.html',
  styleUrl: './screen.scss',
})
export class ScreenComponent implements OnInit, OnDestroy {
  public deskDepartment: any[] = [];
  public now: Date = new Date();
  private refreshTimeout: any;
  private clockInterval: any;
  private destroyed: boolean = false;
  private turnSound: HTMLAudioElement | null = null;
  private lastCurrentTurnKey: string = '';
  private lastScreenDataKey: string = '';
  private readonly isBrowser: boolean = false;
  public monthSelect = [
    { value: 0, month: "Enero" },
    { value: 1, month: "Febrero" },
    { value: 2, month: "Marzo" },
    { value: 3, month: "Abril" },
    { value: 4, month: "Mayo" },
    { value: 5, month: "Junio" },
    { value: 6, month: "Julio" },
    { value: 7, month: "Agosto" },
    { value: 8, month: "Septiembre" },
    { value: 9, month: "Octubre" },
    { value: 10, month: "Noviembre" },
    { value: 11, month: "Diciembre" }];
  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly appRef: ApplicationRef,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly tvTurnService: TvTurnService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.turnSound = new Audio('assets/audio/notification.mp3');
      this.turnSound.load();

      this.ngZone.runOutsideAngular(() => {
        this.clockInterval = setInterval(() => {
          this.ngZone.run(() => {
            this.now = new Date();
            this.cdr.markForCheck();
          });
        }, 1000);
      });

      this.appRef.isStable
        .pipe(
          filter((isStable: boolean) => isStable),
          first()
        )
        .subscribe(() => this.loadInitialScreenTurns());
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private loadInitialScreenTurns(): void {
    this.tvTurnService.getDeskDepartment().subscribe({
      next: (response: any) => {
        const newDeskDepartment = Array.isArray(response) ? response : [];
        const newCurrentTurnKey = this.buildCurrentTurnKey(newDeskDepartment);
        const newScreenDataKey = this.buildScreenDataKey(newDeskDepartment);

        if (
          newCurrentTurnKey !== '' &&
          this.lastCurrentTurnKey !== '' &&
          newCurrentTurnKey !== this.lastCurrentTurnKey
        ) {
          this.playTurnSound();
        }

        this.deskDepartment = newDeskDepartment;
        this.lastCurrentTurnKey = newCurrentTurnKey;
        this.lastScreenDataKey = newScreenDataKey;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.scheduleNextRefresh();
      },
      error: (err: any) => {
        console.log('Error cargando turnos de pantalla', err);
        this.scheduleNextRefresh();
      }
    });
  }

  private refreshScreenTurns(): void {
    this.tvTurnService.getTodayDeskDepartment().subscribe({
      next: (response: any) => {
        const newDeskDepartment = Array.isArray(response) ? response : [];
        const newScreenDataKey = this.buildScreenDataKey(newDeskDepartment);

        if (newScreenDataKey !== this.lastScreenDataKey) {
          const newCurrentTurnKey = this.buildCurrentTurnKey(newDeskDepartment);

          if (
            newCurrentTurnKey !== '' &&
            this.lastCurrentTurnKey !== '' &&
            newCurrentTurnKey !== this.lastCurrentTurnKey
          ) {
            this.playTurnSound();
          }

          this.deskDepartment = newDeskDepartment;
          this.lastCurrentTurnKey = newCurrentTurnKey;
          this.lastScreenDataKey = newScreenDataKey;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }

        this.scheduleNextRefresh();
        console.log(response);
      },
      error: (err: any) => {
        console.log('Error actualizando turnos de pantalla', err);
        this.scheduleNextRefresh();
      }
    });
  }

  private scheduleNextRefresh(): void {
    if (this.destroyed) return;

    this.ngZone.runOutsideAngular(() => {
      this.refreshTimeout = setTimeout(() => {
        this.refreshScreenTurns();
      }, 2000);
    });
  }

  private playTurnSound(): void {
    if (!this.isBrowser || !this.turnSound) return;

    this.turnSound.currentTime = 1;
    this.turnSound.play().catch((error) => {
      console.log('No se pudo reproducir el sonido:', error);
    });
  }

  public getDeskCurrentTurn(turnsDesk: any): any | null {
    const turns = this.getDeskTurns(turnsDesk);
    return turns.find((turn: any) => this.isCurrentTurn(turn)) || null;
  }

  public getDeskPendingTurns(turnsDesk: any): any[] {
    return this.getDeskTurns(turnsDesk).filter((turn: any) => this.isPendingTurn(turn));
  }

  public getDeskMainTicket(turnsDesk: any): string {
    const currentTurn = this.getDeskCurrentTurn(turnsDesk);
    if (currentTurn?.date?.dateCode) {
      return currentTurn.date.dateCode;
    }

    return '---';
  }

  public getDeskMainTime(turnsDesk: any): string {
    const currentTurn = this.getDeskCurrentTurn(turnsDesk);
    if (currentTurn?.date?.dateTime) {
      return currentTurn.date.dateTime.slice(11, 16);
    }

    return '---';
  }

  public getDeskPendingCount(turnsDesk: any): number {
    return this.getDeskPendingTurns(turnsDesk).length;
  }

  public getDepartmentPendingCount(turnsDesks: any[] = []): number {
    return turnsDesks.reduce((total: number, turnsDesk: any) => {
      return total + this.getDeskPendingCount(turnsDesk);
    }, 0);
  }

  public formatTurnTime(turn: any): string {
    return turn?.date?.dateTime?.slice(11, 16) || '---';
  }

  public getTurnStateLabel(turn: any): string {
    if (this.isCurrentTurn(turn)) {
      return 'En mesa';
    }

    if (this.isPendingTurn(turn)) {
      return 'En espera';
    }

    return turn?.state?.name || '---';
  }

  private getDeskTurns(turnsDesk: any): any[] {
    return Array.isArray(turnsDesk?.turns) ? turnsDesk.turns : [];
  }

  private isCurrentTurn(turn: any): boolean {
    return turn?.state?.code === 'in_progress' || turn?.state?.id === 7;
  }

  private isPendingTurn(turn: any): boolean {
    return turn?.state?.code === 'waiting' || turn?.state?.id === 6;
  }

  private buildCurrentTurnKey(groups: any[]): string {
    return groups
      .flatMap((group: any) => Array.isArray(group?.turnsDeskDTOS) ? group.turnsDeskDTOS : [])
      .map((turnsDesk: any) => this.getDeskCurrentTurn(turnsDesk)?.id)
      .filter((turnId: any) => turnId !== undefined && turnId !== null)
      .join('|');
  }

  private buildScreenDataKey(groups: any[]): string {
    return groups
      .map((group: any) => {
        const departmentId = group?.departmentDTO?.id ?? '';
        const desksKey = (Array.isArray(group?.turnsDeskDTOS) ? group.turnsDeskDTOS : [])
          .map((turnsDesk: any) => {
            const deskId = turnsDesk?.desk?.id ?? '';
            const turnsKey = this.getDeskTurns(turnsDesk)
              .map((turn: any) => [
                turn?.id ?? '',
                turn?.state?.id ?? '',
                turn?.state?.code ?? '',
                turn?.date?.id ?? '',
                turn?.date?.dateCode ?? '',
                turn?.date?.dateTime ?? '',
              ].join(','))
              .join(';');

            return `${deskId}[${turnsKey}]`;
          })
          .join('|');

        return `${departmentId}:{${desksKey}}`;
      })
      .join('||');
  }
}
