import {Component} from '@angular/core';
import {BackendService} from "./backend.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedFile?: File;

  msg: any;
  url: any;

  constructor(private service: BackendService) {
  }


  onFileSelect(event: any) {
    console.log(event);

    const reader = new FileReader();
    this.selectedFile = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    

    reader.onload = (_event) => {
      this.msg = "";
      this.url = reader.result;
    }
  }


  predict() {
    console.log(this.selectedFile)
    if (this.selectedFile) {
      this.service.predict(this.selectedFile);
    }
  }
}
