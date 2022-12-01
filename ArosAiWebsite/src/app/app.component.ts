import { Component } from '@angular/core';
import {Observable} from "rxjs";
import {BackendService} from "./backend.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedFiles?: FileList;
  selectedFileNames: string[] = [];

  msg: any;
  url: any;

  constructor(private service : BackendService ) {
  }

  uploadFiles() {

  }


  onFileSelect(event: any) {
    console.log(event);


    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      this.msg = "";
      this.url = reader.result;
    }
  }



  predict() {
    let file : undefined | null | File = this.selectedFiles?.item(0)
    if (file) {
      this.service.predict(file);
    }
  }
}
