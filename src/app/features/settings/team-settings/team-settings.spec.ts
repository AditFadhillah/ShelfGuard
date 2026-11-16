import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TeamService } from '../../../core/services/team.service';
import { TEAM_SEED } from '../../../core/data/mock-data';
import { TeamSettings } from './team-settings';

describe('TeamSettings', () => {
  it('renders one row per team member', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TeamService, useValue: { getMembers: () => of([...TEAM_SEED]) } }],
    });
    const fixture = TestBed.createComponent(TeamSettings);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tr[mat-row]')).toHaveLength(5);
  });
});
