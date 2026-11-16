import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamMember } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  getMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>('/api/team');
  }
}
