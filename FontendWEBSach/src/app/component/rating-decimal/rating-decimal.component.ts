import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbRatingConfig, NgbRatingModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rating-decimal',
  providers: [NgbRatingModule, NgbRatingConfig],
  templateUrl: './rating-decimal.component.html',
  styleUrls: ['./rating-decimal.component.css'],

})
export class RatingDecimalComponent {
  @Output() ratingChange = new EventEmitter<number>();
  @Input() rating: number = 0;

  itemsToRepeat = new Array(5);

  handleUpdateRating(newRate: number) {
    this.rating = newRate;
    this.ratingChange.emit(this.rating);
  }

}
