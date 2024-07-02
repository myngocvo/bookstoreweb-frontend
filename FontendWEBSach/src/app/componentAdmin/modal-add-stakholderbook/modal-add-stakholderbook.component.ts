import {Component, EventEmitter, Output} from '@angular/core';
import {UsersService} from 'src/services/Users/users.service';

@Component({
  selector: 'app-modal-add-stakholderbook',
  templateUrl: './modal-add-stakholderbook.component.html',
  styleUrls: ['./modal-add-stakholderbook.component.css']
})
export class ModalAddStakholderbookComponent {
  DataStaff: any = {}
  @Output() closeModalEvent = new EventEmitter<void>();
  isModalVisible = false;

  constructor(private staffs: UsersService) {
  }

  addStaff() {
    const dataStaff = {
      Id: this.DataStaff.Phone,
      FullName: this.DataStaff.FullName,
      Password: this.DataStaff.Password,
      Email: this.DataStaff.Email,
      Phone: this.DataStaff.Phone,
      Bills: [],
      UserRoles: []
    }
    this.staffs.PostUser(dataStaff).subscribe({
      next: res => {
        alert("Thêm nhân viên thành công!")
      },
      error: err => {
        console.log("Lỗi khi thêm dữ liệu: ", err)
      }
    })
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }


}
