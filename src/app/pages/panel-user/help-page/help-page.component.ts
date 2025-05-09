import { Component, OnInit } from '@angular/core';
import { FaqItem, User } from 'src/app/interfaces/user';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss']
})
export class HelpPageComponent implements OnInit{
  panelOpenState:boolean = false;
  user?: User;
  faqs: FaqItem[] = [];
  faqsOwner: FaqItem[] = [];
  faqsClient: FaqItem[] = [];

  constructor(
    private userService: UserService,
    private publicService: PublicService
  ){
    this.user = this.userService.getCurrentUser();
    console.log("🚀 ~ this.user:", this.user)
  }
  ngOnInit(): void {
    this.getListQuestions();
  }

  async getListQuestions(){
    try {
      const { faqs,faqs_client,faqs_owner } = await this.publicService.getFaqs();
      this.faqs = faqs;
      this.faqsClient = faqs_client;
      this.faqsOwner = faqs_owner;
    } catch (error) {
      console.log("🚀 ~ getListQuestions ~ error:", error)
    }
  }
}
