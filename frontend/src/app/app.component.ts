import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Employee} from './models/employee';
import {DataSource} from '@angular/cdk/collections';
import {AddComponent} from './dialogs/add/add.component';
import {EditComponent} from './dialogs/edit/edit.component';
import {DeleteComponent} from './dialogs/delete/delete.component';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  displayedColumns = ['photo', 'firstName', 'lastName', 'city', 'email', 'contact', 'actions'];
  dataSource!: EmployeeDataSource;
  index!: number;
  contact!: number;
  url !: any;

  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public dataService: DataService) {}

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true })
  sort!: MatSort;
  @ViewChild('filter', { static: true })
  filter!: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew() {
    const dialogRef = this.dialog.open(AddComponent, {
      data: {issue: Employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1 && this.dataService != null) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.dataService.dataChange.value.push(this.dataService.getDialogData());
        this.refreshTable();
      }
    });
  }

  startEdit(i: number, photo: string, firstName: string, lastName: string, city: string, email: string, contact: number) {
    this.contact = contact;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditComponent, {
      data: {photo: photo, firstName: firstName, lastName: lastName, city: city, email: email, contact: contact}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1 && this.dataService != null) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.dataService.dataChange.value.findIndex(x => x.contact === this.contact);
        // Then you update that record using data from dialogData (values you enetered)
        this.dataService.dataChange.value[foundIndex] = this.dataService.getDialogData();
        // And lastly refresh table
        this.refreshTable();
      }
    });
  }

  deleteItem(i: number, firstName: string, lastName: string, email: string, contact: number) {
    this.index = i;
    this.contact = contact;
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: {firstName: firstName, lastName: lastName, email: email, contact: contact}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1 && this.dataService != null) {
        const foundIndex = this.dataService.dataChange.value.findIndex(x => x.contact === this.contact);
        // for delete we use splice in order to remove single object from DataService
        this.dataService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  private refreshTable() {
    // Refreshing table using paginator
    // Thanks yeager-j for tips
    // https://github.com/marinantonio/angular-mat-table-crud/issues/12
    this.paginator._changePageSize(this.paginator.pageSize);
  }



  public loadData() {
    this.dataService = new DataService(this.httpClient);
    console.log(this.dataService)
    this.dataSource = new EmployeeDataSource(this.dataService, this.paginator, this.sort);
    fromEvent(this.filter.nativeElement, 'keyup')
      // .debounceTime(150)
      // .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
}

export class EmployeeDataSource extends DataSource<Employee> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Employee[] = [];
  renderedData: Employee[] = [];

  constructor(public _dataService: DataService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Employee[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._dataService.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._dataService.getEmployees();


    return merge(...displayDataChanges).pipe(map( () => {
        // Filter data
        this.filteredData = this._dataService.data.slice().filter((emp: Employee) => {
          const searchStr = (emp.firstName + emp.lastName + emp.city + emp.email).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());

        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
        return this.renderedData;
      }
    ));
  }

  disconnect() {}


  /** Returns a sorted copy of the database data. */
  sortData(data: Employee[]): Employee[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'firstName': [propertyA, propertyB] = [a.firstName, b.firstName]; break;
        case 'lastName': [propertyA, propertyB] = [a.lastName, b.lastName]; break;
        case 'city': [propertyA, propertyB] = [a.city, b.city]; break;
        case 'email': [propertyA, propertyB] = [a.email, b.email]; break;
        case 'contact': [propertyA, propertyB] = [a.contact, b.contact]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}