import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalLoginComponent } from 'src/app/components/auth/modal-login/modal-login.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  showLoginForm: boolean = false;
  cssInputBase:string="";
  cssFloatLabel:string="";
  cssSpanValidation:string="";
  sended:boolean= false;
  loginForm!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    public publicService: PublicService,
    private globalService: GlobalService,
    private userService: UserService,
    private lang: LangService
  ){}

  ngOnInit(): void {}

  openLoginModal(){
    this.dialog.open(ModalLoginComponent);
  }
}
