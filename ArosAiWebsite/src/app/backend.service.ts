import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from "@angular/common/http";
import {environment} from "../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  url : string = environment.backend_api;

  constructor(private http: HttpClient) { }

  predict(file: File) {
    console.log("hi")
    let formData:FormData = new FormData();
    formData.append('image', file, file.name);
    this.http.post(`${this.url}/predict`, formData)
      .subscribe(
        data => console.log('success' + data),
        error => console.log(error)
      )
  }
}
