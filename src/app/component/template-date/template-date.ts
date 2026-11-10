import { Component, OnInit, ChangeDetectorRef, numberAttribute } from '@angular/core';
import { SessionService } from '../login/services/session.service';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TemplateDateService } from './services/template-date.service';
import { FormsModule } from '@angular/forms';
import { DateService } from '../date/services/date.service';

@Component({
  selector: 'app-template-date',
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './template-date.html',
  styleUrl: './template-date.scss',
})
export class TemplateDateComponent implements OnInit {
  public isSavedTemplate: boolean = true;
  public selectedTemplate: number = 1;
  public userLogged: any;
  public showTimeModal: boolean = false;
  public templateWeekList: any = [[],[],[],[],[],[],[]];
  public totalSlotsGlobal: number = 0;
  public showModalSaveTemplate: boolean = false;
  public showModalCreateDate: boolean = false;
  public weekDaysStr: string[] = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'];
  public validateCreateDates: boolean = false;
  public startDate: any;
  public finishDate: any;
  public showSuccessModal: boolean = false;
  public totalDatesCreated: number = 0;
  public timeSequence: any;
  public timeSequencesList: any[] = [
    {text: '15 minutos', value: 15 },
    {text: '30 minutos', value: 30 },
    {text: '45 minutos', value: 45 },
    {text: '60 minutos', value: 60 }
  ];
  public startSequence: string = '07:00';

  constructor(
    private readonly sessionService: SessionService,
    private readonly cdr: ChangeDetectorRef,
    private readonly templateDateService: TemplateDateService,
    private readonly dateService: DateService
  ){}

  ngOnInit(): void {
      this.userLogged = this.sessionService.currentUser;
      this.isSavedTemplate = true;
      this.timeSequence = this.timeSequencesList[0].value;
      this.templateDateService.getAllTemplatesDates(this.selectedTemplate).subscribe({
        next: (response: any) => {
          for (const template of response) {
            this.templateWeekList[(template.weekday == 7) ? 0 : template.weekday].push(template);
          }
          this.totalSlotsGlobal = this.totalSlots();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          //console.log(err);
        }
      });
  }
  
  changeTemplate(event: Event, numberTemplate: number){
    event.preventDefault();
    if(this.selectedTemplate != numberTemplate){
      this.templateWeekList = [[],[],[],[],[],[],[]];
      this.selectedTemplate = numberTemplate;
      this.templateDateService.getAllTemplatesDates(this.selectedTemplate).subscribe({
          next: (response: any) => {
            for (const template of response) {
              this.templateWeekList[(template.weekday == 7) ? 0 : template.weekday].push(template);
            }
            this.totalSlotsGlobal = this.totalSlots();
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            //console.log(err);
          }
        });
    }
    
  }

  addTemplateDate(event: Event, weekday: number): void {
    event.preventDefault();
    this.isSavedTemplate = false;
    if (this.templateWeekList[weekday].length === 0) {
      if(this.startSequence){
        this.templateWeekList[weekday].push({ 
          id: null,
          hour: this.startSequence,
          weekday: weekday,
          "user": {
              "id": this.userLogged.id
          },
          "numberTemplate": this.selectedTemplate 
        });
      }
      this.totalSlotsGlobal = this.totalSlots();
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    this.sortTemplateDay(weekday);

    const lastItem = this.templateWeekList[weekday][this.templateWeekList[weekday].length - 1];
    const [hours, minutes] = lastItem.hour.split(':').map(Number);

    const totalMinutes = hours * 60 + minutes + Number(this.timeSequence);

    if (totalMinutes >= 24 * 60) {
      return;
    }

    const newHour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const newMinute = String(totalMinutes % 60).padStart(2, '0');

    this.templateWeekList[weekday].push({
      id: null,
      hour: `${newHour}:${newMinute}`,
      weekday: weekday,
      user: {
          id: this.userLogged.id
      },
      "numberTemplate": this.selectedTemplate
    });

    this.sortTemplateDay(weekday);
    this.totalSlotsGlobal = this.totalSlots();
  }

  private sortTemplateDay(weekday: number): void {
    this.templateWeekList[weekday].sort((a: any, b: any) => {
      const [hourA, minuteA] = a.hour.split(':').map(Number);
      const [hourB, minuteB] = b.hour.split(':').map(Number);

      return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
    });
  }

  deleteTemplateDate(weekday: number, hour: string): void {
    this.templateWeekList[weekday] = this.templateWeekList[weekday].filter(
      (item: any) => item.hour !== hour
    );
    this.isSavedTemplate = false;
    this.totalSlotsGlobal = this.totalSlots();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  addTemplatesDates(event: Event){
    let allTemplates: any[] = [];

    for (const day of this.templateWeekList) {
      for (const template of day) {
        if (template.weekday == 0){
          template.weekday = 7;
        }
        allTemplates.push(template);
      }
    }

    this.templateDateService.addTemplatesDates(allTemplates, this.selectedTemplate).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isSavedTemplate = true;
        this.showModalSaveTemplate = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  totalSlots(): number {
    let numSlots = 0;
    for (let slots of this.templateWeekList) {
      numSlots += slots.length;
    }
    return numSlots;
  }

  closeModalSaveTemplate(): void {
    this.showModalSaveTemplate = false;
    this.cdr.detectChanges();
  }

  openModalCreateDate(): void {
    this.showModalCreateDate = true;
    this.changeDate();
    this.cdr.detectChanges();
  }

  closeModalCreateDate(): void {
    this.showModalCreateDate = false;
    this.cdr.detectChanges();
  }

  createDates(): void {
    this.showModalCreateDate = false;
    let dates: any[] = [];

    let currentDate = new Date(this.startDate);
    let endDate = new Date(this.finishDate);

    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      let loopDay = new Date(currentDate);
      let dayOfWeek = loopDay.getDay();

      let templatesOfDay = this.templateWeekList[dayOfWeek];

      for (let template of templatesOfDay) {
        dates.push({
          id: null,
          nameClient: "",
          emailClient: "",
          dateTime: this.buildLocalDateTime(loopDay, template.hour),
          state: {
            id: 1,
            type: 'CITA',
          },
          user: {
            id: this.userLogged.id
          },
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.dateService.createDates(dates).subscribe({
      next: (response: any) => {
        this.totalDatesCreated = response.length;
        this.startDate = null;
        this.finishDate = null;
        this.showSuccessModal = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) =>{
        //console.log(err);
      }
    });
    this.cdr.detectChanges();
  }
    
  private buildLocalDateTime(baseDate: Date, hourString: string): string {
    const [hours, minutes] = hourString.split(':').map(Number);

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    return `${year}-${month}-${day}T${hh}:${mm}:00`;
  }

  changeDate(){
    if ((this.startDate != null && this.startDate != '') && (this.finishDate != null && this.finishDate != '') && this.totalSlotsGlobal != 0) {
      this.validateCreateDates = true;
    } else {
      this.validateCreateDates = false;
    }
    this.cdr.detectChanges();
  }

  closeSuccessModal(){
    this.showSuccessModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
