import {Component} from '@angular/core';
import {BackendService} from "./backend.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // user input
  selectedFile?: File;
  uploaded_image_url?: any = null;

  // predict
  response_probability? : any = null;
  loading_response_probability : boolean = false;

  // explain
  response_explain? : any = null;
  loading_response_explain : boolean = false;

  constructor(private service: BackendService) { }

  onFileSelect(event: any) {
    this.uploaded_image_url = null;
    this.response_probability = null;
    this.response_explain = null;

    const reader = new FileReader();
    this.selectedFile = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      this.uploaded_image_url = reader.result;
    }
  }

  predict() {
    if (this.selectedFile) {
      this.loading_response_probability = true;
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
    if (this.selectedFile) {
      this.loading_response_explain = true;
      this.service.explain(this.selectedFile)
        .subscribe(
          data => {
            const reader = new FileReader();
            reader.readAsDataURL(data);
            reader.onload = (_event) =>  {
              this.response_explain = reader.result;
              this.loading_response_explain = false;
            }
          },
          error => {
            console.log(error);
            this.loading_response_explain = false;
          }
        )
    }
  }
}
