import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideMockHttp } from '../interceptors/provide-mock-http';
import { TeamService } from './team.service';

describe('TeamService', () => {
  it('returns 5 team members', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideMockHttp()] });

    const members = await firstValueFrom(TestBed.inject(TeamService).getMembers());
    expect(members).toHaveLength(5);
    expect(members.every((m) => m.email.includes('@'))).toBe(true);
    vi.restoreAllMocks();
  });
});
