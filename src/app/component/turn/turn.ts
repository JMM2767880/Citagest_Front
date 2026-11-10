import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';

import { TurnService } from './services/turn.service';
import { SessionService } from '../login/services/session.service';
import { DateService } from '../date/services/date.service';

@Component({
  selector: 'app-turn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turn.html',
  styleUrl: './turn.scss',
})
export class TurnComponent implements OnInit, OnDestroy {
  public originalList: any[] = [];
  public turnsList: any[] = [];
  public userLogged: any;
  public showAssignModal = false;
  public nameClientAssigned = '';
  public monthSelect = [
    { value: 0, month: 'Enero' },
    { value: 1, month: 'Febrero' },
    { value: 2, month: 'Marzo' },
    { value: 3, month: 'Abril' },
    { value: 4, month: 'Mayo' },
    { value: 5, month: 'Junio' },
    { value: 6, month: 'Julio' },
    { value: 7, month: 'Agosto' },
    { value: 8, month: 'Septiembre' },
    { value: 9, month: 'Octubre' },
    { value: 10, month: 'Noviembre' },
    { value: 11, month: 'Diciembre' }
  ];
  public dateTimeModalStr = '';
  public hourAssignesStr = '';
  public dateAssigned: any;
  public currentTurn: any;
  public now: Date = new Date();
  public totalTurnPending = 0;
  public totalTurnCurrent = 0;
  public totalTurnNotAssign = 0;
  public showConfirmModal = false;
  public confirmActionType: 'finish' | 'discard' | 'empty' | null = null;
  public selectedTurn: any = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly turnService: TurnService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sessionService: SessionService,
    private readonly dateService: DateService
  ) {}

  ngOnInit(): void {
    this.userLogged = this.sessionService.currentUser;

    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.turnService.getDayTurn()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.turnsList = response ?? [];
          this.originalList = [...this.turnsList];
          this.currentTurn = this.turnsList.find((t: any) => t.state?.id == 7) ?? null;
          this.stadisticTurn();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error(err)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAssignClientModal(dt: any) {
    this.dateAssigned = dt;
    this.showAssignModal = true;

    this.dateTimeModalStr = `${parseInt(dt.dateTime.split('-')[2])} de ${this.monthSelect[parseInt(dt.dateTime.split('-')[1]) - 1].month} de ${dt.dateTime.split('-')[0]}`;
    this.hourAssignesStr = `${dt.dateTime.split('T')[1].split(':')[0]}:${dt.dateTime.split('T')[1].split(':')[1]}`;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.nameClientAssigned = '';
  }

  setClient(event: Event) {
    this.nameClientAssigned = (event.target as HTMLInputElement).value;
  }

  setClientToDate() {
    if (this.nameClientAssigned != '') {
      this.dateAssigned.nameClient = this.nameClientAssigned;
      this.dateService.setClientToDateId(this.dateAssigned).subscribe({
        next: () => {
          this.showAssignModal = false;
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    }
  }

  callTurn(turnCall: any) {
    this.turnService.callTurn(turnCall).subscribe({
      next: () => {},
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  finishTurn(turnFinish: any) {
    this.turnService.finishTurn(turnFinish.id).subscribe({
      next: () => {},
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  discardTurn(turnDiscard: any) {
    this.turnService.discardTurn(turnDiscard.id).subscribe({
      next: () => {},
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  stadisticTurn() {
    this.totalTurnCurrent = 0;
    this.totalTurnPending = 0;
    this.totalTurnNotAssign = 0;

    this.turnsList.forEach((t: any) => {
      if (t.state?.id == 7) this.totalTurnCurrent++;
      if (t.state?.id == 6 && t.date?.nameClient != '') this.totalTurnPending++;
      if (t.date?.nameClient == '') this.totalTurnNotAssign++;
    });
  }

  openConfirmModal(turn: any, action: 'finish' | 'discard' | 'empty') {
    this.selectedTurn = turn;
    this.confirmActionType = action;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.confirmActionType = null;
    this.selectedTurn = null;
  }

  confirmTurnAction() {
    if (!this.selectedTurn || !this.confirmActionType) return;

    if (this.confirmActionType === 'finish') this.finishTurn(this.selectedTurn);
    if (this.confirmActionType === 'discard') this.discardTurn(this.selectedTurn);
    if (this.confirmActionType === 'empty') this.setEmptyClientToDate(this.selectedTurn);

    this.closeConfirmModal();
  }

  setEmptyClientToDate(turn: any) {
    this.dateService.setEmptyClientToDate(turn.date).subscribe({
      next: () => {},
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  searchDate(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.turnsList = [...this.originalList];

    if (value != '') {
      this.turnsList = this.turnsList.filter((t: any) => {
        const isClient = (t.date?.nameClient ?? '').toLowerCase().includes(value);
        const isCode = (t.date?.dateCode ?? '').toLowerCase().includes(value);
        const isHour = (t.date?.dateTime?.split('T')[1] ?? '').includes(value);
        return isClient || isCode || isHour;
      });
    }
  }
}