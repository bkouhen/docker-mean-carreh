import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/background';

export interface Background {
  url: string;
  position: number;
}

@Injectable({providedIn: 'root'})
export class BackgroundService {

  constructor(private http: HttpClient) {}

  updateBackgroundImages(files: any) {
    if (!files[0] && !files[1] && !files[2]) {
      return;
    }
    let backgroundData = new FormData();
    for (var i = 0; i < 3; i++) {
      if (files[i]) {
        backgroundData.append('background', files[i])
      } else {
        backgroundData.append('notUpdatedPos', i.toString())
      }
    }
    return this.http.post<{message: string}>(BACKEND_URL + '/update', backgroundData);
  }

  getBackgroundImages() {
    return this.http.get<{message:string, background: Background[] }>(BACKEND_URL);
  }

  deleteBackgroundImage(pos: number) {
    return this.http.delete<{message: string}>(BACKEND_URL + '/delete/' + pos);
  }
}
