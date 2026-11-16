import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user.model';

@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  readonly appHasRole = input.required<Role>();

  private readonly auth = inject(AuthService);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);

  // computed() dedupes: the effect only re-runs when the boolean actually flips.
  private readonly allowed = computed(() => this.auth.role() === this.appHasRole());

  constructor() {
    effect(() => {
      this.container.clear();
      if (this.allowed()) {
        this.container.createEmbeddedView(this.template);
      }
    });
  }
}
