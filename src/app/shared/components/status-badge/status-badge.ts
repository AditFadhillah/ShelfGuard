import { Component, input } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { StockStatus } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-status-badge',
  imports: [MatChip],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly status = input.required<StockStatus>();
}
