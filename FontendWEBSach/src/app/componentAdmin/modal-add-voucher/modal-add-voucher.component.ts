import {Component, EventEmitter, Output} from '@angular/core';
import {VoucherService} from 'src/services/Voucher/voucher.service';

@Component({
  selector: 'app-modal-add-voucher',
  templateUrl: './modal-add-voucher.component.html',
  styleUrls: ['./modal-add-voucher.component.css']
})
export class ModalAddVoucherComponent {
  @Output() closeModalEvent = new EventEmitter<void>();
  isModalVisible = false;
  DataVoucher: any = {};

  constructor(private vouchers: VoucherService) {
  };

  addVoucher() {
    const dateBegin = new Date(); // Current date
    console.log(this.DataVoucher.PercentDiscount)
    const dataVoucher = {
      Id: this.DataVoucher.Id,
      Quantity: this.DataVoucher.Quantity,
      PercentDiscount: this.DataVoucher.PercentDiscount,
      MaxDiscount: this.DataVoucher.MaxDiscount,
      DateBegin: this.DataVoucher.dateBegin,
      DateEnd: this.DataVoucher.dateEnd
    }
    this.vouchers.PostVoucher(dataVoucher).subscribe({
      next: res => {
        console.log(res);
        this.DataVoucher = {};
        alert("Thêm voucher thành công!");
        window.location.reload();
      },
      error: err => {
        console.log("Lỗi tạo thêm: ", err)
      }
    })
  }

  convertToUppercase(value: string): string {
    return value.toUpperCase();
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
