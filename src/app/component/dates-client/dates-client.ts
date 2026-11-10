import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DepartmentService } from './services/department.service';
import { DateService } from '../date/services/date.service';
import { FormsModule } from '@angular/forms';
import { response } from 'express';

@Component({
  selector: 'app-dates-client',
  imports: [FormsModule],
  templateUrl: './dates-client.html',
  providers: [], 
  styleUrl: './dates-client.scss',
})
export class DatesClientComponent implements OnInit {
  public departments: any[] = [];
  public step: number = 1;
  public departmentSelected: any;
  public daySelected: any;
  public dates: any[] = [];
  public days: any[] = [];
  public weekDaysStr: string[] = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'];
  public monthList: string[] = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];
  public hoursList: any[] = [];
  public hour: any;
  public nameClient: string = '';
  public dateCreated: any;

  constructor(
    private readonly departmentService: DepartmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dateService: DateService
  ){
  }

  ngOnInit(): void {
    this.step = 1;
    this.departmentService.getDepartments().subscribe({
      next: (response: any) => {
        this.departments = response;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  selectDepartment(depart: any) {
    this.departmentSelected = depart;    
    this.dateService.getDatesDepartment(this.departmentSelected?.id).subscribe({
      next: (response: any) => {
        this.dates = response;

        this.days = [...new Set(
          this.dates.map(d => new Date(d.dateTime).toISOString().split('T')[0])
        )]
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(day => ({
          date: day,
          weekDay: new Date(day).getDay(),
          day: new Date(day).getDate(),
          month: new Date(day).getMonth()
        }));

        this.step = 2;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error obteniendo fechas:", err);
      }
    });
  }

  selectDay(date: any){
    this.daySelected = date;
    this.dateService.getDatesDepartmentsDate(this.departmentSelected.id, this.daySelected + "T00:00:00"). subscribe({
      next: (response: any) => {      
        this.hoursList = [...new Set(
          response.map((d: any) =>
            new Date(d.dateTime).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          )
        )].sort((a: any, b: any) => a.localeCompare(b));
        this.daySelected = {
          day: new Date(date).getDate(),
          weekDay: new Date(date).getDay(),
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth()
        };
        this.step = 3;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        //console.log(err);
      }
    });
  }

  resetStep(): void {
    this.step = 1;
  }

  selectTime(hour: any): void {
    this.hour = hour;
    this.step = 4;
  }

  createDate(){
    let dateSelectedStr = `${this.daySelected.year}-${String(this.daySelected.month + 1).padStart(2, '0')}-${String(this.daySelected.day).padStart(2, '0')}`;
    let dateModify = {
      id: null,
      dateTime: dateSelectedStr + 'T' + this.hour, 
      nameClient: this.nameClient,
      user: {
        department: {
          id: this.departmentSelected.id
        }
      }
    }

    this.dateService.setClientToDate(dateModify).subscribe({
      next: (response: any) => {
        this.dateCreated = response;
        this.step = 5;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 409) {
          alert(
            'Ese horario acaba de ocuparse. Vuelve a seleccionar una cita.'
          );
        } else if (err.status === 400) {
          alert(
            'Comprueba el nombre y que la fecha de la cita sea futura.'
          );
        } else {
          alert(
            'No se ha podido reservar la cita. Inténtalo de nuevo.'
          );
        }
      }
    });
  }

  goToStart(): void{
    this.departmentSelected = null;
    this.daySelected = null;
    this.dates = [];
    this.days = [];
    this.hoursList = [];
    this.hour = '';
    this.nameClient = '';
    this.dateCreated = null;
    this.step = 1;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
