import {Component} from '@angular/core';
import {BackendService} from "./backend.service";
import {connect, Observable, Subject} from "rxjs";
import {WebcamImage} from "ngx-webcam";

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

    this.response_probability = null;
    this.response_explain = null;

    const reader = new FileReader();
    this.selectedFile = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    console.log(event.target.files[0])
    reader.onload = (_event) => {
      this.uploaded_image_url = reader.result;
      console.log("file: "+this.uploaded_image_url)
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



  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  sysImage:any = '';
  xd:any=''
  public getSnapshot(): void {
    this.trigger.next(void 0);
  }
  public captureImg(webcamImage: any): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;

    let photo = new File([this.sysImage], 'captured_photo', { type: 'image/jpeg', lastModified:Date.now()})
    let reader = new FileReader()
    this.selectedFile = photo
    reader.readAsDataURL(photo)
    reader.onload = (_event) => {
      this.xd = reader.result;
      this.uploaded_image_url = reader.result
      console.log(this.uploaded_image_url)
    }
    console.info('got webcam image', this.xd);
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

}
