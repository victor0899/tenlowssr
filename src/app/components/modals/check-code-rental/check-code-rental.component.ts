import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { OperationInfo, TypeConfirmRental } from 'src/app/interfaces/payments';
import { UserAuth } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-check-code-rental',
  templateUrl: './check-code-rental.component.html',
  styleUrls: ['./check-code-rental.component.scss']
})
export class CheckCodeRentalComponent implements OnInit {

  isLoad: boolean = false;

  formCheckCode: FormGroup;

  cssInputTxt: string;
  cssFloatLabel: string;
  cssSpanValidation: string;
  currentUser!: UserAuth;
  code: string = '';

  constructor(
    private form: FormBuilder,
    private publicService: PublicService,
    private storeService: StoreService,
    private userService: UserService,
    private globalService: GlobalService,
    private userServive: UserService,
    private paymentService: PaymentsService,
    private lang: LangService,
    private dialogRef: MatDialogRef<CheckCodeRentalComponent>,
    @Inject(MAT_DIALOG_DATA) private params: { type: TypeConfirmRental, operation: OperationInfo }
  ) {
    this.formCheckCode = this.form.group({
      code: ['', [Validators.required, Validators.minLength(5)]]
    });
    this.currentUser = this.userServive.currentUser!;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase;
    this.cssInputTxt = this.publicService.cssInputBase;
    this.cssSpanValidation = this.publicService.cssSpanValidationBase;

  }
  ngOnInit() {

    const { personal_info } = this.currentUser;

    if (!personal_info?.phone) {
      this.dialogRef.close();
      this.isLoad = false;
      return this.globalService.showInfo({
        msg: 'components.check_code.must_enter_phone'
      });
    }

    this.requestCode();
  }

  async requestCode() {
    try {
      this.isLoad = true;


      console.log('verificar usuario', this.userService.currentUser)
      this.code = Math.floor(10000 + Math.random() * 90000).toString();
      const { name, last_name, personal_info, email } = this.userService.currentUser!;

      const response: GraphResponse = await this.storeService.requestCodeEmail(email, `${name} ${last_name}`, this.code);

      if (response.errors) throw (response.errors);
      if (response.data.f2AEmailRequest !== 'ok') throw ('Error sending email');
      this.globalService.showToast(this.lang._('components.check_code.code_sended'), 'OK', 'top');
    } catch (error) {
      console.log("🚀 ~ requestCode ~ error:", error);
      this.dialogRef.close();
      this.globalService.showInfo({
        msg: 'components.check_code.err_request_code'
      });

    } finally {
      this.isLoad = false;
    }
  }

  getErrorLabel(formField: string) {
    const inputCtrl = this.formCheckCode.get(formField) ?? this.formCheckCode.get(formField);

    if (!inputCtrl?.value) return 'messages.field_required';

    if (inputCtrl?.value == '') return 'messages.field_required';

    if (inputCtrl?.invalid) return 'messages.enter_valid_field';

    if (inputCtrl.errors) {
      if (inputCtrl.errors['maxlength']) return 'components.update_phone.limit_length_phone';
    }

    return '';
  }

  async checkCode() {
    try {
      this.isLoad = true;

      const { personal_info } = this.userService.currentUser!;

      const phone = personal_info?.phone.replace('+', '')!;

      const { code } = this.formCheckCode.value;

      console.log('comprarnado', code, 'tjhis.code', this.code)
      let validate = code == this.code
      // const response: GraphResponse = await this.storeService.validateCodeRental(phone, code);

      // if (response.errors) throw (response.errors);

      // const data = JSON.parse(response.data.f2AVerify);

      // if (data.status !== 'ok') throw ('err validate sms')

      if (!validate) {
        throw ('invalid code')
      }

      if (this.params.type == TypeConfirmRental.received) {
        this.authorizePayment();
      }

      this.dialogRef.close(true);
      

    } catch (error) {
      console.log("🚀 ~ checkCode ~ error:", error);

      this.globalService.showInfo({
        msg: 'components.check_code.err_invalid_code'
      });
    } finally {

      this.isLoad = false;
    }
  }

  async authorizePayment() {
    try {
      this.isLoad = true;
      const { operation } = this.params;

      const response = await this.paymentService.confirmAuthorizationPayment({
        amount: operation.amount * 100,
        id_operation: operation.payment.transaction_id,
        order_id: operation.payment.order_id,
        operation_id: operation.id
      });

      console.log("🚀 ~ authorizePayment ~ response:", response)
      if (response.errors) throw (response.errors);
    } catch (error) {
      console.log("🚀 ~ authorizePayment ~ error:", error)
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
    } finally {
      this.isLoad = false;
    }
  }
}
