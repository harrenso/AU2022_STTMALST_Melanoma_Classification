import {Component} from '@angular/core';
import {BackendService} from "./backend.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedFile?: File;

  url?: any = null;

  // predict
  response_probability? : any = null;
  loading_response_probability : boolean = false;

  // predict
  response_explain? : any = null;
  loading_response_explain : boolean = false;

  constructor(private service: BackendService) {
  }


  onFileSelect(event: any) {
    console.log(event);

    const reader = new FileReader();
    this.selectedFile = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);


    reader.onload = (_event) => {
      this.url = reader.result;
    }
  }


  predict() {
    console.log(this.selectedFile)
    this.loading_response_probability = true;
    if (this.selectedFile) {
      this.service.predict(this.selectedFile)
        .subscribe(
          data => {
            this.response_probability = data
            this.loading_response_probability = false;
          },
          error => {
            console.log(error);
            this.loading_response_probability = false;
          }
        )
    }
  }

  explain() {
    console.log(this.selectedFile)
    this.loading_response_explain = true;
    if (this.selectedFile) {
      this.service.explain(this.selectedFile)
        .subscribe(
          data => {
            this.response_explain = data;
            console.log(data)
            this.loading_response_explain = false;
          },
          error => {
            console.log(error);
            this.loading_response_explain = false;
          }
        )
    }
  }
}
