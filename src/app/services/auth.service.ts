import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.api;
  token: string;
  userId: string;
  isAuth$ = new BehaviorSubject<boolean>(false); // dif entre SUBJECT ET BehaviorSubject, le 2 prend une val par defaut.

  constructor(private http: HttpClient) {
    this.initAuth();
   }

  initAuth() {
    if (typeof localStorage !== 'undefined') {
      const data = JSON.parse(localStorage.getItem('auth'));
      if(data) {
        if(data.userId && data.token) {
          this.userId = data.userId;
          this.token = data.token;
          this.isAuth$.next(true);
        }
      }
    }
  }

  /**
   * On sait que le meth va s realisé 3,4 seconde donc si on l'appelle direct elle ne va pa s'executer why we use Promise
   * Car elle va attendre
   * @param email email
   * @param password  password
   */
  signup(email: string, password: string) { 
    return new Promise((resolve, reject) => {
      this.http.post(this.api + 'users/signup', {email: email, password: password}).subscribe(
        (signUpData: {status: number, message: string}) => {
          if (signUpData.status === 201) {
          // Authentifier l'utilisateur
            this.signin(email, password)
            .then(() => {
              resolve(true);
            }
            )
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(signUpData.message);
        }
        },
        (err) => {
          reject(err);
        }
      )
    })
  }

  signin(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.http.post(this.api + 'users/login', {email: email, password: password}).subscribe(
        (authData: {token: string, userId: string}) => {
          this.token = authData.token;
          this.userId = authData.userId;
          this.isAuth$.next(true);
          // Save authData in local
          if (typeof localStorage !== "undefined") {
            localStorage.setItem('auth', JSON.stringify(authData));
          }
          resolve(true);
        },
        (err) => {
          reject(err);
        }
      )
    })
  }

  logout(){ 
    this.isAuth$.next(false);
    this.userId = null;
    this.token = null;
    if(typeof localStorage !== "undefined"){
      localStorage.setItem('auth', null);
    }}
}
