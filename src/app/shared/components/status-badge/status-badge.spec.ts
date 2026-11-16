import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each(['In Stock', 'Low Stock', 'Out of Stock'] as const)('renders "%s"', async (status) => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('mat-chip')?.textContent).toContain(status);
  });
});
