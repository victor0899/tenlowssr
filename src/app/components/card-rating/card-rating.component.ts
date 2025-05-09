import { Component, Input, OnInit } from '@angular/core';
import { CalificationData } from 'src/app/interfaces/user';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'card-rating',
  templateUrl: './card-rating.component.html',
  styleUrls: ['./card-rating.component.scss']
})
export class CardRatingComponent implements OnInit{
  @Input() calification!: CalificationData;

  stars: number[] = [];

  constructor(
    public publicService: PublicService
  ){}

  ngOnInit(): void {
    this.stars = [...Array(parseInt(this.calification.rating.toString())).keys()];
  }

  getUserName(){
    const { name, last_name } = this.calification.user;
    return `${name} ${last_name}`;
  }
}
