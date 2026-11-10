import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateService } from '../date/services/date.service';
import { SessionService } from '../login/services/session.service';

@Component({
  selector: 'app-calendar',
  imports: [FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent implements OnInit {
  public userLogged: any;
  private minYear!: number;
  private maxYear!: number;
  public currentYear!: number;
  public yearsSelect: number[] = [];
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
  public currentMonth!: number;
  public selectedYear!: number;
  public selectedMonth!: number;
  public dayAux: number = 1;
  public firstDay: any;
  public numWeekDayFirstDay: any;
  public lastDay: any;
  public calendarPrint: any[] = [];
  public counterDatesList: any[] = [];
  public showTotalDatesModal: boolean = false;
  public showTotalDates: boolean = false;
  public showAssignetDates: boolean = false;
  public showFreeDates: boolean = false;
  public datesTotal: any[] = [];
  public datesShowModal: any[] = [];
  public typeDatesModalStr: string = '';
  public dateTimeModalStr: string = '';
  public showAssignModal: boolean = false;
  public hourAssignesStr: string = '';
  public dateAssigned: any;
  public nameClientAssigned: string = '';
  public showConfirmModal = false;
  public selectedDate: any;
  public showSearchDatesModal: boolean = false;
  public searchDatesList: any[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly dateService: DateService,
    private readonly sessionService: SessionService
  ){}

  ngOnInit(): void {
      this.userLogged = this.sessionService.currentUser;
      this.minYear = new Date().getFullYear()-2;
      this.maxYear = new Date().getFullYear()+2;
      this.currentYear = new Date().getFullYear();
      this.currentMonth = new Date().getMonth();

      this.selectedMonth = this.currentMonth;
      this.selectedYear = this.currentYear;

      for(let i = this.minYear; i <= this.maxYear; i++){
        this.yearsSelect.push(i);
      }

      this.cdr.detectChanges();

      this.dateService.getCountDatesByMonth(`${this.selectedYear}-${String(this.selectedMonth+1).padStart(2, '0')}-01T00:00:00`).subscribe({
        next: (response: any) => {
          this.counterDatesList = response;
          this.printCalendar(this.selectedMonth, this.selectedYear);

        },
        error: (err: any) => {
          //console.log(err);
        }
      });
  }

  printCalendar(month: number, year: number) {
    this.calendarPrint = [];
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();

    let day = 1;
    let week: (any | null)[] = [];

    for (let i = 0; i < firstWeekDay; i++) {
      week.push(null);
    }

    while (day <= lastDay) {
      let totals = this.searchTotalCountByDates(`${String(year)}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      if(totals){
        week.push({
          day: day,
          date: `${String(year)}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          totalDates: totals.totalDates,
          assignedDates: totals.assignedDates,
          freeDates: totals.freeDates
        });
      }else{
        week.push({
          day: day,
          date: `${String(year)}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          totalDates: 0,
          assignedDates: 0,
          freeDates: 0
        });
      }
      day++;

      if (week.length === 7) {
        this.calendarPrint.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      this.calendarPrint.push(week);
    }
    this.cdr.detectChanges();
  }

  changeFilterDate(){
    this.dateService.getCountDatesByMonth(`${this.selectedYear}-${String(this.selectedMonth+1).padStart(2, '0')}-01T00:00:00`).subscribe({
        next: (response: any) => {
          this.counterDatesList = response;
          this.printCalendar(this.selectedMonth, this.selectedYear);
        },
        error: (err: any) => {
          //console.log(err);
        }
      });
  }

  searchTotalCountByDates(day: string): any {
    return this.counterDatesList.find((t: any) => t.day == day );
  }

  getDatesByDateTime(date: string, type: string) {
    this.dateTimeModalStr = `${parseInt(date.split('-')[2])} de ${this.monthSelect[parseInt(date.split('-')[1])-1].month} de ${date.split('-')[0]}`;
    switch(type){
      case 'total':
        this.showTotalDates = true;
        this.showAssignetDates = false;
        this.showFreeDates = false;
        this.typeDatesModalStr = 'Citas totales';
        break;
      case 'assigned':
        this.showTotalDates = false;
        this.showAssignetDates = true;
        this.showFreeDates = false;
        this.typeDatesModalStr = 'Citas asignadas';
        break;
      case 'free':
        this.showTotalDates = false;
        this.showAssignetDates = false;
        this.showFreeDates = true;
        this.typeDatesModalStr = 'Citas libres';
        break;
      default:
        this.showTotalDates = true;
        this.showAssignetDates = false;
        this.showFreeDates = false;
        this.typeDatesModalStr = 'Citas totales';
    } 

    this.dateService.getDatesByDateTime(date).subscribe({
      next: (response: any) => {
        this.showTotalDatesModal = true;
        if(this.showTotalDates){
          this.datesShowModal = response;
        }else if(this.showAssignetDates) {
          this.datesShowModal = response.filter((t: any) => t.nameClient !== '' );
        }else {
          this.datesShowModal = response.filter((t: any) => t.nameClient === '' );
        }
        
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  closeTotalModal(){
    this.showTotalDatesModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  openAssignClientModal(dt: any) {
    this.dateAssigned = dt;
    this.showTotalDatesModal = false;
    this.showAssignModal = true;

    this.dateTimeModalStr = `${parseInt(dt.dateTime.split('-')[2])} de ${this.monthSelect[parseInt(dt.dateTime.split('-')[1])-1].month} de ${dt.dateTime.split('-')[0]}`;
    this.hourAssignesStr = `${dt.dateTime.split('T')[1].split(":")[0]}:${dt.dateTime.split('T')[1].split(":")[1]}`;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.nameClientAssigned = '';
  }

  setClient(event: Event){
    this.nameClientAssigned = (event.target as HTMLInputElement).value;
  }

  setClientToDate(){
    if(this.nameClientAssigned != '') {
      this.dateAssigned.nameClient = this.nameClientAssigned;
      this.dateService.setClientToDateId(this.dateAssigned).subscribe({
        next: (response: any) => {
          this.showAssignModal = false;
            const dateModify = this.counterDatesList.find(
            (d: any) => response.dateTime.split('T')[0] === d.day
          );

          if (dateModify) {
            dateModify.assignedDates = (dateModify.assignedDates ?? 0) + 1;
            dateModify.freeDates = (dateModify.freeDates ?? 0) - 1;
          }
          this.printCalendar(this.selectedMonth, this.selectedYear);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          //console.log(err);
        }
      });
    }
  }
  
  closeConfirmModal(){
    this.showConfirmModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

   openConfirmModal(date: any) {
    this.selectedDate = date;
    this.showTotalDatesModal = false;
    this.showConfirmModal = true;
  }

  confirmTurnAction() {
    this.setEmptyClientToDate(this.selectedDate);
    this.closeConfirmModal();
  }

  setEmptyClientToDate(date: any){
    this.counterDatesList = [];
    this.dateService.setEmptyClientToDate(date).subscribe({
      next: (response: any) => {
        this.datesShowModal = this.datesShowModal.filter((d: any) => d.id !== response.id);
        this.dateService.getCountDatesByMonth(`${this.selectedYear}-${String(this.selectedMonth+1).padStart(2, '0')}-01T00:00:00`).subscribe({
          next: (response: any) => {
            this.counterDatesList = response;
            this.printCalendar(this.selectedMonth, this.selectedYear);

          },
          error: (err: any) => {
            //console.log(err);
          }
        });
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  getCalendar(calendar: 'prev' | 'next'){
    this.selectedMonth = (calendar == 'prev') ? ((this.selectedMonth == 0) ? 11 : this.selectedMonth-1) : ((this.selectedMonth == 11) ? 0 : this.selectedMonth+1);
    this.selectedYear = (calendar == 'prev') ? ((this.selectedMonth == 11) ? this.selectedYear-1 : this.selectedYear) : ((this.selectedMonth == 0) ? this.selectedYear+1 : this.selectedYear);
    this.counterDatesList = [];
    this.printCalendar(this.selectedMonth, this.selectedYear);
    this.dateService.getCountDatesByMonth(`${this.selectedYear}-${String(this.selectedMonth+1).padStart(2, '0')}-01T00:00:00`).subscribe({
        next: (response: any) => {
          this.counterDatesList = response;
          this.printCalendar(this.selectedMonth, this.selectedYear);
        },
        error: (err: any) => {
          //console.log(err);
        }
      });
  }
}

