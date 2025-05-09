import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfoItem } from 'src/app/interfaces/public';

@Component({
  selector: 'app-how-works-tenlow',
  templateUrl: './how-works-tenlow.component.html',
  styleUrls: ['./how-works-tenlow.component.scss']
})
export class HowWorksTenlowComponent {
  infoNeedSave: InfoItem[] = [
    {
      title: 'pages.how_works.explore_catalog',
      subtitle:'pages.how_works.explore_catalog_info',
      image: 'assets/images/how_work/explore.svg'
    },
    {
      title: 'pages.how_works.register_account',
      subtitle:'pages.how_works.register_account_info',
      image: 'assets/images/how_work/signup.svg'
    },
    {
      title: 'pages.how_works.booking_item',
      subtitle:'pages.how_works.booking_item_info',
      image: 'assets/images/how_work/booking.svg'
    },
    {
      title: 'pages.how_works.return_safe',
      subtitle:'pages.how_works.return_safe_info',
      image: 'assets/images/how_work/return.svg'
    }
  ];

  infoEarnMoney: InfoItem[] = [
    {
      title: 'pages.how_works.add_items',
      subtitle:'pages.how_works.add_items_info',
      image: 'assets/images/how_work/add_item.svg'
    },
    {
      title: 'pages.how_works.set_prices',
      subtitle:'pages.how_works.set_prices_info',
      image: 'assets/images/how_work/set_price.svg'
    },
    {
      title: 'pages.how_works.accept_request',
      subtitle:'pages.how_works.accept_request_info',
      image: 'assets/images/how_work/approves.svg'
    },
    {
      title: 'pages.how_works.any_problem',
      subtitle:'pages.how_works.any_problem_info',
      image: 'assets/images/how_work/calm.svg'
    }
  ];

  constructor(
    private router: Router
  ){}

  navAuth(){
    this.router.navigateByUrl('auth/register')
  }
}
