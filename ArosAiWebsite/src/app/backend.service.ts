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
    let formData:FormData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(`${this.url}/predict`, formData);
  }

  explain(file: File) {
    let formData:FormData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(`${this.url}/explain`, formData, { responseType: 'blob' });
  }
}
