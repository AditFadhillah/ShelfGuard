import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('shows the title and message', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: MAT_DIALOG_DATA, useValue: { title: 'Sure?', message: 'This is final.' } }],
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Sure?');
    expect(text).toContain('This is final.');
  });
});
