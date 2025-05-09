import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectProductTablonComponent } from 'src/app/components/modals/select-product-tablon/select-product-tablon.component';
import { GraphResponse } from 'src/app/interfaces/graph';
import { PaginatorInfo } from 'src/app/interfaces/public';
import { BoardService } from 'src/app/services/board.service';
import { PublicService } from 'src/app/services/public.service';
import { MatTableDataSource } from '@angular/material/table';
import { BoardData, CreateRequestBoardPayload, ResponseRequestBoard, ResponseRequestBoardStatus } from 'src/app/interfaces/board';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductInfo } from 'src/app/interfaces/store';
import { LangService } from 'src/app/services/lang.service';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-table-requests',
  templateUrl: './table-requests.component.html',
  styleUrls: ['./table-requests.component.scss']
})
export class TableRequestsComponent implements OnInit {
  @ViewChild('matPaginator') matPaginator!: MatPaginator;
  @ViewChild('matMyPaginator') matMyPaginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['Necesito', '¿Dónde?', '¿Cuándo?'];
  dataSource!: MatTableDataSource<BoardData>;

  isShowTable: boolean = true;

  cssInputTxt: string = "";
  cssFloatLabel: string = "";
  cssSpanValidation: string = "";

  paginator!: PaginatorInfo;
  listRequests: Array<BoardData> = [];
  isLoadBoard: boolean = true;
  pageEvent!:PageEvent;
  currentPage:number = 1;

  formCreateRequest: FormGroup;
  sended: boolean = false;
  showError: boolean = false;
  userCurrent?:User;
  isShowMyRequest:boolean = false;
  isShowMyAnswers:boolean = false;

  myListRequests: Array<BoardData> = [];
  myPaginator!: PaginatorInfo;
  isLoadMyBoard: boolean = true;
  myPageEvent!:PageEvent;
  myCurrentPage:number = 1;

  pagesIndex: Array<number> = [];


  myListAnswers: Array<ResponseRequestBoard> = [];
  isLoadMyAnswers: boolean = true;
  showResponseResquest: boolean = false;
  requestSelect!: BoardData;

  isShowLoader: boolean = false;
  responseReqBoardStatus = ResponseRequestBoardStatus;



  constructor(
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public publicService: PublicService,
    private boardService: BoardService,
    private userService: UserService,
    private globalService: GlobalService,
    private lang: LangService
  ){
    this.userCurrent = this.userService.getCurrentUser();
    this.cssInputTxt = this.publicService.cssInputBase
    this.cssFloatLabel = this.publicService.cssFloatLabelBase
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-medium';

    this.formCreateRequest = this.fb.group({
      need: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      zip_code: ['', [Validators.required, Validators.minLength(5),Validators.maxLength(5), Validators.pattern(this.publicService.regExpPostalCode)]],
      province: ['', [Validators.required, Validators.minLength(3),Validators.pattern(this.publicService.regExpString)]]
    });

    //**************** */
    if(this.router.url.includes('my-petition')){
      this.showPetitionFromNotification();
    }
  }

  async showPetitionFromNotification(){
    const idPetition =  this.route.snapshot.params['id'];
    await this.openMyRequests();
    const response = this.myListRequests.filter( req => req.id == idPetition )[0];
    this.showResponses(response);
  }

  //#region GET FORM FIELDS

  get need() {
    return this.formCreateRequest.get('need');
  }

  get description() {
    return this.formCreateRequest.get('description');
  }

  get province() {
    return this.formCreateRequest.get('province');
  }

  get zip_code() {
    return this.formCreateRequest.get('zip_code');
  }

  //#endregion

  async ngOnInit(){
    await this.getRequestBoard();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  userSendedResponse( board: BoardData ){
    const temp = board.responses.find( resp => resp.user_id == this.userCurrent?.id);
    if(temp) return true;
    return false;
  }

  getTextStatusBoardItem( board:BoardData ){
    const myAnswer = board.responses.find( resp => resp.user_id == this.userCurrent?.id);
    if( myAnswer?.status == 'pending') return 'pages.table_request.pending';
    if( myAnswer?.status == 'solved') return 'pages.table_request.solved';
    return 'pages.table_request.no_solved';
  }

  getStatusTextAnswer( status: ResponseRequestBoardStatus){
    const texts = {
      pending: 'pages.table_request.pending',
      solved: 'pages.table_request.solved',
      unsolved: 'pages.table_request.no_solved'
    }

    return texts[status] ?? status;
  }

  isSolvesRequest( board:BoardData ){
    const myAnswer = board.responses.find( resp => resp.user_id == this.userCurrent?.id);
    if( myAnswer?.status == 'solved') return true;
    return false;
  }

  openModalHaveProduct(item:BoardData){

    if(!this.userCurrent) {
      this.globalService.showInfo({
        msg:'messages.should_login'
      });
      return;
    }

    const dialogRef = this.dialog.open(SelectProductTablonComponent, {
      data:{
        request_id: item.id,
        locator_id: item.locator_user_id
      }
    });

    dialogRef.afterClosed().subscribe((result: ProductInfo) => {
      if(result){
        const resp: ResponseRequestBoard = {
          id: '',
          product_id: result.id,
          product: {
            id: result.id,
            images: result.images,
            title: result.title,
            __typename: ''
          },
          user_id: this.userCurrent?.id ?? '',
          request_board_id: item.id,
          status: ResponseRequestBoardStatus.pending,
          __typename: '',
          user: {
            id: this.userCurrent?.id ?? '',
            name: this.userCurrent?.name ?? '',
            last_name: this.userCurrent?.last_name ?? '',
            email: this.userCurrent?.email ?? '',
            profile_photo_path: this.userCurrent?.profile_photo_path ?? '',
            __typename: ''
          }
        };
        item.responses.push(resp);
        console.log(`Dialog result: ${result}`);
      }
    });
  }

  async getRequestBoard(){
    try {
      const response: GraphResponse = await this.boardService.getRequestBoard(this.currentPage);
      if(response.errors) throw(response.errors);
      const { requestsBoard  } = response.data;
      this.paginator = requestsBoard.paginatorInfo;
      this.listRequests = requestsBoard.data;
      this.pagesIndex = [...Array(this.paginator.lastPage).keys()];
      console.log("🚀 ~ getRequestBoard ~ response:", requestsBoard.data)
      this.isLoadBoard = false;
    } catch (error) {
      this.isLoadBoard = false;
      console.log("🚀 ~ getRequestBoard ~ error:", error)
    }
  }

  async handlePageEvent(e: PageEvent){
    this.isLoadBoard = true;
    this.pageEvent = e;

    if(e.previousPageIndex == undefined) return;

    if(e.previousPageIndex > this.matPaginator.pageIndex){
      this.currentPage--;
    } else {
      this.currentPage++;
    }

    if(this.currentPage > this.paginator.lastPage) return;

    await this.getRequestBoard();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  validateForm(){
    this.formCreateRequest.markAllAsTouched()
    this.showError = true;

    if(this.formCreateRequest.invalid) return;

    this.sended = true;

    const payload: CreateRequestBoardPayload = {
      need: this.need?.value,
      description: this.description?.value,
      zip_code: this.zip_code?.value,
      province: this.province?.value
    };

    this.onCreateRequest(payload);
  }

  async onCreateRequest(payload:CreateRequestBoardPayload){
    try {
      this.showError = false;
      const response:GraphResponse = await this.boardService.createRequestBoard(payload);
      console.log("🚀 ~ onCreateRequest ~ response:", response.data.createRequestBoard);
      if(response.errors) throw(response.errors);
      this.listRequests.unshift(response.data.createRequestBoard)
      this.globalService.showInfo({
        msg:'pages.table_request.request_created_success'
      });
      this.hideForm();
      this.sended = false;
    } catch (error) {
      this.globalService.showInfo({
        msg:'messages.global_err'
      });
      this.sended = false;
      console.log("🚀 ~ onCreateRequest ~ error:", error)
    }
  }

  openFormRequest(){
    if(!this.userCurrent) {
      this.globalService.showInfo({
        msg:'messages.should_login'
      });
      return;
    }

    this.isShowTable = !this.isShowTable;
  }

  hideForm(){
    this.formCreateRequest.reset();
    this.showError = false
    this.sended = false;
    this.isShowTable = !this.isShowTable;
  }

  async openMyRequests(){

    this.isLoadMyBoard = true;
    this.isShowTable = true;
    this.isShowMyRequest = !this.isShowMyRequest;
    this.isShowMyAnswers = false;

    if(!this.myListRequests.length) {
      await this.getMyRequestBoard();
      return;
    }

    this.isLoadMyBoard = false;
    return;
  }

  openMyAnswers(){
    this.isLoadMyAnswers = true,
    this.isShowTable = true;
    this.isShowMyAnswers = !this.isShowMyAnswers;
    this.isShowMyRequest = false;
    this.getMyAnswersBoard();
    setTimeout(() => this.isLoadMyAnswers = false, 1000);
  }

  async selectPage(indexPage:number){
    this.isLoadBoard = true;
    this.currentPage = indexPage;
    await this.getRequestBoard();
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  async getMyRequestBoard(){
    try {
      const response: GraphResponse = await this.boardService.getMyBoardRequest();
      console.log("🚀 ~ getMyRequestBoard ~ response:", response.data)
      if(response.errors) throw(response.errors);
      const { getUserRequestBoard } = response.data;
      // this.myPaginator = getUserRequestBoard.paginatorInfo;
      this.myListRequests = getUserRequestBoard;
      this.isLoadMyBoard = false;
    } catch (error) {
      this.isLoadMyBoard = false;
      console.log("🚀 ~ getRequestBoard ~ error:", error)
    }
  }

  confirmDeleteRequest(board: BoardData){
    const ref = this.matDialog.open(ModalConfirmComponent,{
      data:{
        title: this.lang._('pages.table_request.delete_request'),
        msg: this.lang._('pages.table_request.delete_request_info'),
      }
    });

    ref.afterClosed().subscribe( ( resp ) => {
      if(resp){
        this.deleteRequest(board);
      }
    });
  }

  async deleteRequest( board: BoardData ){
    this.isShowLoader = true;
    try {
      console.log('delete');
      const response: GraphResponse = await this.boardService.deleteRequest(board.id);
      console.log("🚀 ~ deleteRequest ~ response:", response);
      if(response.errors) throw(response.errors);
      this.myListRequests = this.myListRequests.filter( item => item.id !== board.id );
      this.listRequests = this.listRequests.filter( item => item.id !== board.id );
      this.globalService.showToast(this.lang._('pages.table_request.item_board_delete'),'Ok', 'top');
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ deleteRequest ~ error:", error);
      this.globalService.showToast(this.lang._('pages.table_request.err_item_board_delete'),'Ok', 'top');
    }
  }

  showResponses( board: BoardData ){
    this.showResponseResquest = true;
    this.requestSelect = board;
  }
  hiddenResponses( board: BoardData ){
    this.showResponseResquest = false;
    if(this.router.url.includes(this.lang._locale == 'es' ? 'mi-peticion' : 'my-petition')){
      this.router.navigate( [this.lang._locale == 'es' ? 'tablon/tablon-solicitudes' :'tablon/table-requests'], { queryParamsHandling: 'merge'});
    }
  }

  openProduct(idProduct:string, title:string){

    console.log('dddd id prodicto', idProduct)
    const productUrl = this.router.serializeUrl(
      this.router.createUrlTree([this.lang._locale == 'es' ? `producto/${title.replace(/\s+/g, '-')}/${idProduct}` : `products/${title.replace(/\s+/g, '-')}/${idProduct}`])
      
    );

    window.open(productUrl, '_blank');
  }

  async setSolvedProduct( respBoard:ResponseRequestBoard ){
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.boardService.setProductSolved(respBoard.id);
      if(response.errors) throw(response.errors);
      this.globalService.showInfo({
        msg:'pages.table_request.item_board_solved'
      });
      respBoard.status = this.responseReqBoardStatus.solved;
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ setSolvedProduct ~ error:", error)
      this.globalService.showToast(this.lang._('pages.table_request.err_solve_response_board'), 'Ok', 'top');
    }
  }

  async setNoSolvedProduct(respBoard:ResponseRequestBoard){
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.boardService.setProductUnsolved(respBoard.id);
      if(response.errors) throw(response.errors);
      this.globalService.showInfo({
        msg:'pages.table_request.item_board_solved'
      });
      respBoard.status = this.responseReqBoardStatus.unsolved;
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ setSolvedProduct ~ error:", error)
      this.globalService.showToast(this.lang._('pages.table_request.err_solve_response_board'), 'Ok', 'top');
    }
  }


  async getMyAnswersBoard(){
    try {
      const response: GraphResponse = await this.boardService.getAnswersBoard(1);
      console.log("🚀 ~ getMyAnswersBoard ~ response:", response.data);
      if(response.errors) throw(response.errors);
      const  { getSendResponseRequestBoard } = response.data;
      this.myPaginator = getSendResponseRequestBoard.paginatorInfo;
      this.myListAnswers = [...getSendResponseRequestBoard.data];
    } catch (error) {
      console.log("🚀 ~ getMyAnswersBoard ~ error:", error)
    }
  }
}
