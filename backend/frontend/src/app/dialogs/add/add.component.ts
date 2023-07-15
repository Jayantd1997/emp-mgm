import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {DataService} from '../../services/data.service';
import {FormControl, Validators} from '@angular/forms';
import {Employee} from '../../models/employee';

@Component({
  selector: 'app-add.dialog',
  templateUrl: '../../dialogs/add/add.component.html',
  styleUrls: ['../../dialogs/add/add.component.css']
})

export class AddComponent {
  url: any = ""
  matDatepicker !: any
  countries: Array<any> = [
    {name: "India", states: ["Maharashtra", "Hariyana", "Karnataka"]},
    {name: "USA", states: ["California", "Texas"]}
  ];
  states: Array<any> = []
  mockStates: Array<any> = [
    {name: "Maharashtra", cities: ["Nagpur", "Bhandara", "Amravati"]},
    {name: "Karnataka", states: ["Bengaluru", "Mangalore"]}
  ];
  cities: Array<any> = []
  skills: Array<any> = [
    "Communication", "Ability to Work underPrePressure", "Decision Making", "Time Management", "Self-motivation", "Conflict Resolution","Leadership","Adaptability"
  ]
  constructor(public dialogRef: MatDialogRef<AddComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Employee,
              public dataService: DataService) { }
  
  changeCountry(name: any) {
    // console.log(count)
    this.states = this.countries.find(con => con.name == name).states;
  }
  changeState(name: any) {
    this.cities = this.mockStates.find(con => con.name == name).cities;
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        var target = event.target
        if(target != null) {
          this.url = target.result;
        }
        
      }
    }
  }
  public delete(){
    this.url = null;
  }

  formControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :
      this.formControl.hasError('email') ? 'Not a valid email' :
        '';
  }

  submit() {
  // empty stuff
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    console.log(this.data)
    this.dataService.addIssue(this.data);
  }
}