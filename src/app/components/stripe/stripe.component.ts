import { Component, OnInit, Input } from '@angular/core';
import { StripeService } from '../../services/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { GlobalService } from 'src/app/services/global.service';
import { GraphResponse } from 'src/app/interfaces/graph';
import { StoreService } from 'src/app/services/store.service';
import { OperationData, PayloadCheckout } from 'src/app/interfaces/store';
import dayjs from 'dayjs';
import { PaymentsService } from 'src/app/services/payments.service';
import { LangService } from 'src/app/services/lang.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-payment',
    templateUrl: './stripe.component.html',
    styleUrls: ['./stripe.component.scss']
})
export class PaymentComponent implements OnInit {
    @Input() total: number = 0;
    @Input() userInfo: any = null;
    @Input() checkoutData: any = null;
    @Input() shippingInfo: any = null
    operationData!: OperationData;
    isLoad: boolean = false;
    stripeData: any = null;
    isShowSuccess: boolean = false;

    constructor(
        private stripeService: StripeService,
        private globalService: GlobalService,
        private storeService: StoreService,
        private paymentService: PaymentsService,
        private lang: LangService,
        private route: ActivatedRoute
    ) { }

    async registerPayment() {
        try {
            this.isLoad = true;
            console.log('a;gp aqui')
            const response: GraphResponse = await this.paymentService.setPaymentOperation({
                operation_id: this.operationData.id,
                payment_method_id: '1',
                transaction_id: this.stripeData.id,
                amount: this.operationData.amount,
                order_id: this.stripeData.id
            });

            if (response.errors) throw (response.errors);

            // this.authorizePayment();
            this.globalService.removeData(this.globalService.STORAGE_CHECKOUT_DATA);
            this.isShowSuccess = true;
            this.isLoad = false;
            const ref = this.globalService.showInfo({
                msg: `pages.checkout.success`
            });
            ref.afterClosed().subscribe(resp => location.reload())
        } catch (error) {
            console.log("🚀 ~ registerPayment ~ error:", error)
            this.isLoad = false;
            console.log("🚀 ~ doCheckout ~ error:", error);
            this.globalService.showInfo({
                msg: 'messages.global_err'
            })
        }
    }

    async authorizePayment() {
        try {
            const { rentalData } = this.checkoutData;
            const total = rentalData.cost * rentalData.duration + this.shippingInfo.cost;

            const response: GraphResponse = await this.paymentService.authorizePayment({
                // transaction_id: this.stripeData.id,
                amount: total * 100,
                order_id: this.stripeData.id,
                operation_id: this.operationData.id,
                id_operation: this.operationData.id
            });

            // if (response.errors) throw (response.errors);

            // const objResponse = JSON.parse(response.data.authorizationPayment);
            // console.log("🚀 ~ authorizePayment ~ objResponse:", objResponse);

            // if (objResponse.errorCode) {
            //     const err = this.msgErrAuthorizePayment(objResponse.errorCode);
            //     throw (err);
            // }



        } catch (error: any) {

            this.deleteOperation();

            this.isLoad = false;

            if (typeof error == 'string') {
                return this.globalService.showInfo({
                    msg: error.toString()
                });
            }

            console.log("🚀 ~ autorizePayment ~ error:", error)
        }
    }

    async deleteOperation() {
        try {
            this.isLoad = true;
            const response: GraphResponse = await this.storeService.deleteOperation(this.operationData.id);
            if (response.errors) throw (response.errors);
        } catch (error) {
            console.log("🚀 ~ deleteOperation ~ error:", error)
        } finally {
            this.isLoad = false;
        }
    }

    async ngOnInit() {
       
        const stripe = await this.stripeService.getStripe();

        if (stripe) {
            const totalString = this.total * 100;
            const total = totalString.toFixed(0)
            console.log('informacion del usuario', this.userInfo)
            console.log('informacion del pedido', this.checkoutData)

            const clientSecret = await this.stripeService.paymentIntent(parseInt(total), 'eur', this.userInfo.name, this.userInfo.email, this.checkoutData.product.user.id);

            const appearance = { /* appearance */ };

            const options: any = {
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                }
            };

            const elements = stripe.elements({ clientSecret, appearance });

            // const cardElement = elements.create('card');
            // cardElement.mount('#card-element');
            // const form = document.getElementById('payment-form');

            const cardElement = elements.create('payment', options);
            cardElement.mount('#payment-element');
            const form = document.getElementById('payment-form');


            if (form) {
                form.addEventListener('submit', async (event) => {
                    this.isLoad = true
                    event.preventDefault();
                    const tempTotal = this.checkoutData.amount + this.shippingInfo.cost;
                    let payload: PayloadCheckout = {
                        user_id: this.checkoutData.user_id,
                        amount: parseFloat(tempTotal.toFixed(2)),
                        product_id: this.checkoutData.product.id,
                        type: 'rental',
                        init_date: dayjs(this.checkoutData.init_date).format('YYYY-MM-DD'),
                        end_date: dayjs(this.checkoutData.end_date).format('YYYY-MM-DD'),
                        shipping_method: this.shippingInfo.method,
                        shipping_address: this.shippingInfo.address!,
                        shipping_code: clientSecret.split('_secret')[0]
                    };
                    const response: GraphResponse = await this.storeService.createOperation(payload);
                    if (response.errors) {
                        const ref = this.globalService.showInfo({
                            msg: `error, ${response?.errors[0]?.message}`
                        });
                        ref.afterClosed().subscribe(resp => location.reload())
                    } else {
                        console.log('intento', clientSecret)
                        const { createOperation } = response.data;
                        this.operationData = createOperation;
                        console.log('ver que hay aqui createOperation', createOperation)
                        
                        // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                        //     payment_method: { card: cardElement },
                        // });
        
                        const { error }  = await stripe.confirmPayment({
                            elements,
                            confirmParams: {
                                return_url: `${window.location.origin}/compras/confirmar`,
                            },
                        })

                        if (error) {
                            this.isLoad = false
                            console.error('error en el pago', error);
                            const ref = this.globalService.showStripe({
                                msg: `pages.checkout.${error?.code}`
                            });
                            this.deleteOperation();
                            ref.afterClosed().subscribe(resp => location.reload())
                        } else {
                            // this.stripeData = paymentIntent
                            // await this.registerPayment();
                        }
                    }
                });
            }
        } else {
            console.error('error');
        }
    }

    msgErrAuthorizePayment(codeErr: string) {

        const msgErr = (msg: string) => this.lang._('pages.checkout.' + msg);

        const errCodes: { [key: string]: string } = {
            "SIS0502": msgErr('err_id_oper'),
            "SIS0019": msgErr('err_amount'),
            "SIS0218": msgErr('err_commerce_operation'),
            "SIS0028": msgErr('err_commerce_disabled'),
            "SIS0031": msgErr('err_method_wrong'),
            "SIS0040": msgErr('err_config_commerce'),
            "SIS0051": msgErr('err_order_repeated'),
            "SIS0071": msgErr('err_card_expired'),
            "SIS0256": msgErr('err_commerce_unauthorized'),
            "SIS0257": msgErr('err_card_unauthorized'),
            "SIS0295": msgErr('err_duplicate_operation'),
            "SIS0033": msgErr('err_invalid_operation'),
            "SIS0055": msgErr('err_order_multiple_payments'),
            "SIS0066": msgErr('err_month_card'),
            "SIS0067": msgErr('err_month_card'),
            "SIS0068": msgErr('err_month_card'),
            "SIS0069": msgErr('err_year_card'),
            "SIS0070": msgErr('err_year_card'),
            "SIS0064": msgErr('err_card_number'),
        };

        return errCodes[codeErr] ?? msgErr('err_authorize_payment');
    }
}
