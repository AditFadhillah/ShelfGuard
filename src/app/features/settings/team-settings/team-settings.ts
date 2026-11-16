import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { TeamService } from '../../../core/services/team.service';
import { TeamMember } from '../../../core/models/user.model';

@Component({
  selector: 'app-team-settings',
  imports: [MatTableModule],
  templateUrl: './team-settings.html',
})
export class TeamSettings {
  protected readonly columns = ['name', 'email', 'role'];
  protected readonly members = toSignal(inject(TeamService).getMembers(), {
    initialValue: [] as TeamMember[],
  });
}
