import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OasisService {
  public API_URL = 'http://localhost:2212';

  constructor(private http: HttpClient) {}

  public najdiKarty(id: any) {
    return this.http.get<any>(this.API_URL + '/scan/' + id).pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  public najdiKarty2(id: any, typ:any) {
    return this.http.get<any>(this.API_URL + '/manual/' + id +'/' + typ).pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      })
    );
  }
}
