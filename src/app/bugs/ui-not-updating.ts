import { Component, signal } from '@angular/core';

/** BUG 1 – BEFORE: a plain field changed inside setTimeout. In a zoneless app nothing tells Angular to re-render. */
@Component({
  selector: 'app-ui-before',
  template: `
    <button type="button" (click)="load()" class="btn">Load profile</button>
    <p class="mt-3 text-sm">Status: <strong>{{ status }}</strong></p>
    <p class="mt-1 text-sm">User: <strong>{{ user }}</strong></p>
  `,
})
export class UiBefore {
  status = 'Idle';
  user = '—';
  load() {
    this.status = 'Loading…';
    setTimeout(() => {          // simulated API call
      this.status = 'Loaded ✔';   // ❌ value changes, but the screen never updates
      this.user = 'Priya Sharma';
    }, 800);
  }
}

/** BUG 1 – AFTER: signals notify Angular automatically. */
@Component({
  selector: 'app-ui-after',
  template: `
    <button type="button" (click)="load()" class="btn">Load profile</button>
    <p class="mt-3 text-sm">Status: <strong>{{ status() }}</strong></p>
    <p class="mt-1 text-sm">User: <strong>{{ user() }}</strong></p>
  `,
})
export class UiAfter {
  status = signal('Idle');
  user = signal('—');
  load() {
    this.status.set('Loading…');
    setTimeout(() => {
      this.status.set('Loaded ✔');  // ✅ signal update re-renders the view
      this.user.set('Priya Sharma');
    }, 800);
  }
}
