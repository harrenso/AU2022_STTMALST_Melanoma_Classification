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
  response_probability?: any = null;
  loading_response_probability: boolean = false;

  // explain
  response_explain?: any = null;
  loading_response_explain: boolean = false;

  constructor(private service: BackendService) {
  }

  onFileSelect(event: any) {

    this.response_probability = null;
    this.response_explain = null;

    const reader = new FileReader();
    this.selectedFile = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    console.log(event.target.files[0])
    reader.onload = (_event) => {
      this.uploaded_image_url = reader.result;
      this.pic_taken_flag = true
      console.log("file: " + this.uploaded_image_url)
    }
  }

  predict() {
    if (this.selectedFile) {
      console.log(this.selectedFile)
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
            reader.onload = (_event) => {
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
  access_camera_flag = false;
  pic_taken_flag = false
  button_msg:string="Turn on webcam"
  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  public captureImg(webcamImage: any): void {
    this.saveWebCamPictureAsFile(webcamImage)
    let reader = new FileReader()
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile)
      reader.onload = (_event) => {
        this.uploaded_image_url = reader.result
        this.pic_taken_flag =true
      }
    }
  }

  saveWebCamPictureAsFile(webcamImage: WebcamImage) {
    const arr = webcamImage.imageAsDataUrl.split(",");
    // @ts-ignore
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    this.selectedFile = new File([u8arr], "uploaded image", { type: 'image/jpeg' })
  }

  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  redoPhoto() {
    this.pic_taken_flag = false
    this.selectedFile = new File([], '')
  }

  accessCamera(){
    this.access_camera_flag = true
  }

  photoButton(){
    if(!this.access_camera_flag){
      this.accessCamera()
      this.button_msg = "Take a picture"
      this.access_camera_flag = true
    }
    else if(!this.pic_taken_flag){
      this.getSnapshot()
      this.pic_taken_flag = true
      this.button_msg = "Retake a picture"
    }
    else if(this.pic_taken_flag){
      this.redoPhoto()
    }
  }
}
