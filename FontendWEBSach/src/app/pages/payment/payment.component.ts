import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {forkJoin} from 'rxjs';
import {Router} from '@angular/router';
import {SharedataService} from 'src/services/sharedata/sharedata.service';
import {BooksService} from 'src/services/Books/books.service';
import {BookDetailsViewModel} from 'src/interfaces/fullbook';
import {CustomermainService} from 'src/services/customermain/customermain.service';
import {CustomerService} from 'src/services/customer/customer.service';
import {OrdersService} from 'src/services/Orders/orders.service';
import {Order} from 'src/interfaces/Orders';
import { VoucherService } from 'src/services/Voucher/voucher.service';
declare var paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  checkedProductIds: string[] = [];
  productsPrice: { [id: string]: number } = {};
  quantity: { [key: string]: number } = {};
  books: BookDetailsViewModel[] = [];
  idcustomer: string = '';
  address: string = '';
  Orderdata: Order[] = [];
  currentDate = new Date();
  year = this.currentDate.getFullYear();
  month = (this.currentDate.getMonth() + 1).toString().padStart(2, '0');
  day = this.currentDate.getDate().toString().padStart(2, '0');
  hours = this.currentDate.getHours().toString().padStart(2, '0');
  minutes = this.currentDate.getMinutes().toString().padStart(2, '0');
  seconds = this.currentDate.getSeconds().toString().padStart(2, '0');
  totalmoney: number = 0;
  IscheckOrder: boolean = false;
  selectedPaymentMethod: string = 'cash';
  showPaypalButton: boolean = false;
  vouchers: any[] = [];

  // Exchange rate (example rate)
  exchangeRate: number = 23000; // VND to USD

  constructor(
    private ren: Renderer2,
    private ele: ElementRef,
    private OrderService: OrdersService,
    private customer: CustomerService,
    private customerMain: CustomermainService,
    private router: Router,
    private sharedata: SharedataService,
    private bookfull: BooksService,
    private voucherService: VoucherService,
  ) {
    this.sharedata.checkedProductIds$.subscribe((value) => {
      this.checkedProductIds = value;
    });

    this.sharedata.productsPrice$.subscribe((value) => {
      this.productsPrice = value;
    });

    this.sharedata.quantity$.subscribe((value) => {
      this.quantity = value;
    });

    this.calculateTotalMoney();

    if (this.checkedProductIds.length !== 0) {
      this.displayPaymentSection(true);
      this.getCustomerID();
      this.loadProduct();
    } else {
      this.displayPaymentSection(false);
    }
  }

  ngOnInit() {
    this.renderPaypalButton();
    this.loadVouchers();
  }

  displayPaymentSection(display: boolean) {
    const payment = this.ele.nativeElement.querySelector('#ment');
    if (payment) {
      this.ren.setStyle(payment, 'display', display ? 'block' : 'none');
    }
  }
// //////
  calculateTotalMoney() {
    this.totalmoney = this.checkedProductIds.reduce((acc, id) => {
      return acc + (this.productsPrice[id] * (this.quantity[id] || 1));
    }, 0);
  }

  getCustomerID() {
    this.idcustomer = this.customer.getClaimValue();
    this.customerMain.CustomersId(this.idcustomer).subscribe({
      next: (res) => {
        this.address = res.address;
        console.log(this.address);
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin khách hàng', err);
      },
    });
  }

  loadProduct() {
    const bookObservables = this.checkedProductIds.map(id => this.bookfull.getBookDetailsWithImagesid(id));
    forkJoin(bookObservables).subscribe({
      next: (results) => {
        this.books = results;
      },
      error: (err) => {
        console.log('Lỗi khi lấy thông tin sách', err);
      }
    });
  }

  percent1(price: number, per: number): number {
    return price * (1 - per / 100);
  }

  stranUser() {
    this.router.navigate(['user']);
  }

// Paypal
  onPaymentMethodChange(event: any) {
    this.selectedPaymentMethod = event.value;
    this.showPaypalButton = this.selectedPaymentMethod === 'paypal';
    if (this.showPaypalButton) {
      setTimeout(() => {
        this.renderPaypalButton();
      });
    }
  }

  renderPaypalButton() {
    if (document.getElementById('paypal-button')) {
      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          const amountInUSD = (this.totalmoney + 20000) / this.exchangeRate;
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: amountInUSD.toFixed(2) // Ensure 2 decimal places
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            // console.log('Transaction completed by ' + details.payer.name.given_name);
            alert('Giao dịch hoàn tất bởi ' + details.payer.name.given_name);
            this.processOrder();
          });
        },
        onError: (err: any) => {
          // console.error('PayPal transaction error:', err);
          alert('Đã xảy ra lỗi trong quá trình thanh toán bằng PayPal. Vui lòng thử lại sau.');
        }
      }).render('#paypal-button');
    }
  }


  processOrder() {
    if (this.address) {
      if (this.checkedProductIds.length > 0) {
        let ordersProcessed = 0;
        const totalOrders = this.checkedProductIds.length;

        for (let i of this.checkedProductIds) {
          const dataOrder = {
            id: `${i}${this.hours}:${this.minutes}:${this.seconds}`,
            customerId: this.idcustomer,
            orderDate: `${this.year}-${this.month}-${this.day}`,
            status: 0,
            address: this.address,
            description: `${this.year}-${this.month}-${this.day} ${this.hours}:${this.minutes}:${this.seconds}`,
            unitPrice: this.quantity[i] * this.productsPrice[i],
            quantity: this.quantity[i],
            bookId: i,
          };

          this.OrderService.postOrder(dataOrder).subscribe({
            next: (res) => {
              ordersProcessed++;
              if (ordersProcessed === totalOrders) {
                alert('Vui lòng chờ xác nhận đơn hàng từ shop');
                this.resetState();
                this.router.navigate(['user']);
              }
            },
            error: (err) => {
              console.error('Lỗi khi xử lý đơn hàng', err);
            },
          });
        }
      } else {
        alert('Không có sản phẩm nào được chọn.');
      }
    } else {
      alert('Vui lòng chọn vào mục địa chỉ khác để điền thông tin địa chỉ giao hàng');
    }
  }

  resetState() {
    this.checkedProductIds = [];
    this.productsPrice = {};
    this.quantity = {};
    this.books = [];
    this.totalmoney = 0;
    this.showPaypalButton = false;
    this.selectedPaymentMethod = 'cash';
    this.displayPaymentSection(false);
  }

  Order() {
    this.processOrder();
  }

  loadVouchers() {
    this.voucherService.Vouchers().subscribe(
      (data: any[]) => {
        this.vouchers = data;
      },
      (error: any) => {
        console.error('Error loading vouchers:', error);
      }
    );
  }
  selectedCoupon: string | null = null;
  discountAmount: number = 0;
  updateDiscountAmount(selectedVoucher: any) {
    if (selectedVoucher && selectedVoucher.percentDiscount) {
      this.discountAmount = (this.totalmoney * selectedVoucher.percentDiscount) / 100;
    } else {
      this.discountAmount = 0;
    }
  }
  
}
