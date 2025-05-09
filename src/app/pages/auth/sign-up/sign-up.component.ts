import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalRegisterComponent } from 'src/app/components/auth/modal-register/modal-register.component';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  constructor(
    private dialog: MatDialog,
    public publicService: PublicService
  ){}

  openSignupModal(){
    this.dialog.open(ModalRegisterComponent);
  }
}
