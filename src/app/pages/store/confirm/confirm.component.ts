import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphResponse } from 'src/app/interfaces/graph';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StoreService } from 'src/app/services/store.service';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
    selector: 'confirm-component',
    templateUrl: './confirm.component.html'
})

export class ConfirmComponent implements OnInit {
    isLoad: boolean = false;
    constructor(
        private route: ActivatedRoute,
        private stripeService: StripeService,
        private storeService: StoreService,
        private paymentService: PaymentsService,
        private globalService: GlobalService,
        private router: Router,
        private lang: LangService,
    ) { }

    async ngOnInit() {
        this.route.queryParams.subscribe(async params => {
            const paymentIntent = params['payment_intent'];
            const stripe = await this.stripeService.getStripe();
            const resOperation = await this.storeService.getOperationID(paymentIntent);
            this.isLoad = true;
            if (paymentIntent) {
                if (!stripe) {
                    return;
                }
                console.log('ver el pago', paymentIntent)
                console.log('ver la operacion', resOperation)

                const clientSecret = new URLSearchParams(window.location.search).get(
                    'payment_intent_client_secret'
                );
                if (clientSecret) {
                    stripe.retrievePaymentIntent(clientSecret).then(async ({ paymentIntent }) => {
                        if (paymentIntent?.status == "requires_capture") {
                            if (resOperation.data.getOperationID.payment == null) {
                                const response: GraphResponse = await this.paymentService.setPaymentOperation({
                                    operation_id: resOperation.data.getOperationID.operation.id,
                                    payment_method_id: '1',
                                    transaction_id: resOperation.data.getOperationID.operation.shipping_code,
                                    amount: resOperation.data.getOperationID.operation.amount,
                                    order_id: resOperation.data.getOperationID.operation.shipping_code
                                });

                                if (response.errors) throw (response.errors);

                                this.globalService.removeData(this.globalService.STORAGE_CHECKOUT_DATA);
                                this.isLoad = false;
                                const ref = this.globalService.showStripe({
                                    title: 'Tu pago ha sido realizado con éxito',
                                    msg: '!Gracias!',
                                });
                                ref.afterClosed().subscribe(resp => {
                                    this.router.navigate([this.lang._locale == 'es' ? 'compras/tienda' : 'shopping/store']);
                                })
                            } else {
                                this.isLoad = false;
                                const ref = this.globalService.showStripe({
                                    title: 'Tu pago ha sido realizado con éxito',
                                    msg: '!Gracias!',
                                });
                                ref.afterClosed().subscribe(resp => {
                                    this.router.navigate([this.lang._locale == 'es' ? 'compras/tienda' : 'shopping/store']);
                                })
                            }
                        } else {
                            const ref = this.globalService.showInfo({
                                msg: "Error en el pago"
                            });
                            ref.afterClosed().subscribe(resp => {
                                this.router.navigate([this.lang._locale == 'es' ? 'compras/tienda' : 'shopping/store']);
                            })
                        }
                    })
                }
            }
        })
    }
}