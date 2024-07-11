import {Component} from '@angular/core';
import {User} from 'src/interfaces/User';
import {UsersService} from 'src/services/Users/users.service';

@Component({
  selector: 'app-staff-admin',
  templateUrl: './staff-admin.component.html',
  styleUrls: ['./staff-admin.component.css']
})
export class StaffAdminComponent {
  Users: User[] = [];
  filteredUsers: User[] = [];
  user: any = {};
  selectAllChecked = false; 
  selectedStaff: any[] = []; 
  assets: any;
  isDeleteModalVisible = false;
  isAddStaffModalVisible = false;

  constructor(private users: UsersService) {
  }

  ngOnInit() {
    this.users.Users().subscribe({
      next: res => {
        this.Users = res;
        console.log(res)
        this.loadpro(null);
      },
      error: err => {
        console.log("Lỗi lấy dữ liệu: ", err)
      }
    })
  }

  loadpro(searchTerm: string | null) {
    if (searchTerm && searchTerm.trim() !== '') {
      this.filteredUsers = this.Users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.filteredUsers = this.Users.slice(0, 25);
    }
    console.log(this.filteredUsers)
  }

  selectAll(event: any) {
    this.selectAllChecked = event.target.checked; 

    if (this.selectAllChecked) {
      this.selectedStaff = this.Users.slice(0, 25);
    } 
    else {
      this.selectedStaff = [];
    }
  }

  selectStaff(event: any, staff: any) {
    if (event.target.checked) {
      this.selectedStaff.push(staff);
    } else {
      const index = this.selectedStaff.findIndex((selectedStaff) => selectedStaff.id === staff.id);
      if (index !== -1) {
        this.selectedStaff.splice(index, 1);
      }
    }
    this.selectAllChecked = this.selectedStaff.length === this.Users.slice(0, 25).length;
  }

  

  // Hàm xóa sách
  deleteStaff(cmt: any) {
    console.log('Deleting staff:',);
  }

  // Hiển thị modal xác nhận xóa
  openDeleteModal() {
    this.isDeleteModalVisible = true;
  }

  // Đóng modal xác nhận xóa
  closeDeleteModal() {
    this.isDeleteModalVisible = false;
  }

  // Hiển thị modal add
  openAddStaffModal() {
    this.isAddStaffModalVisible = true;
  }

  // Đóng modal add
  closeAddtStaffModal() {
    this.isAddStaffModalVisible = false;
  }
}
