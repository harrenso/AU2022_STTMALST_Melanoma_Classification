import {Component, OnInit} from '@angular/core';
import {BackendService} from "./backend.service";
import {Observable, Subject} from "rxjs";
import {ImageCroppedEvent} from "ngx-image-cropper";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // user input
  unCroppedSelectedFile?: File;
  unCroppedImageUrl?: any = null;
  croppedSelectedFile?: File;
  croppedImageUrl?: any = null;

  // webcam
  private trigger: Subject<any> = new Subject();
  access_camera_flag = false;
  pic_taken_flag = false
  camera_available = true
  button_msg: string = "Turn on webcam"

  // predict
  response_probability?: any = null;
  loading_response_probability: boolean = false;

  // explain
  response_explain?: any = null;
  loading_response_explain: boolean = false;

  constructor(private service: BackendService) {
  }

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({video: {width:30,height:30, }}).catch(err => {
      if (err.toString().includes("Permission denied")|| err.message == "The request is not allowed by the user agent or the platform in the current context.") {
        this.camera_available = false
      }
    })
  }

  resetInput() {
    this.response_probability = null;
    this.response_explain = null;
    this.unCroppedImageUrl = undefined;
    this.unCroppedSelectedFile = undefined;
    this.croppedImageUrl = undefined;
    this.croppedSelectedFile = undefined;
    this.pic_taken_flag = false
  }

  // File Upload
  onFileSelect(event: any) {
    this.resetInput()
    const reader = new FileReader();
    this.unCroppedSelectedFile = event.target.files[0];
    this.croppedSelectedFile = this.unCroppedSelectedFile
    reader.readAsDataURL(event.target.files[0]);
    console.log(event.target.files[0])
    reader.onload = (_event) => {
      this.unCroppedImageUrl = reader.result;
      this.pic_taken_flag = true
    }
  }

  // Webcam
  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  public captureImg(webcamImage: any): void {
    this.unCroppedSelectedFile = this.savePictureAsFile(webcamImage.imageAsDataUrl)
    let reader = new FileReader()
    if (this.unCroppedSelectedFile) {
      reader.readAsDataURL(this.unCroppedSelectedFile)
      reader.onload = (_event) => {
        this.unCroppedImageUrl = reader.result
        this.pic_taken_flag = true
      }
    }
  }

  savePictureAsFile(url : any) {
    const arr = url.split(",");
    // @ts-ignore
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image", {type: 'image/jpeg'})
  }

  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  redoPhoto() {
    this.resetInput();
  }

  accessCamera() {
    this.access_camera_flag = true
  }

  photoButton() {
    if (!this.access_camera_flag) {
      this.accessCamera()
      this.button_msg = "Take a picture"
      this.access_camera_flag = true
    } else if (!this.pic_taken_flag) {
      this.getSnapshot()
      this.pic_taken_flag = true
      this.button_msg = "Retake a picture"
    } else if (this.pic_taken_flag) {
      this.redoPhoto()
      this.button_msg = "Take a picture"
    }
  }

  // Crop image
  cropImg(e: ImageCroppedEvent) {
    this.croppedImageUrl = e.base64;
    this.croppedSelectedFile = this.savePictureAsFile(e.base64);
  }

  // Communication with backend
  predict() {
    if (this.croppedSelectedFile) {
      this.loading_response_probability = true;
      this.service.predict(this.croppedSelectedFile)
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
    if (this.croppedSelectedFile) {
      this.loading_response_explain = true;
      this.service.explain(this.croppedSelectedFile)
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
}
