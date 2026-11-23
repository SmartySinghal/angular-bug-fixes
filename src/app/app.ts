import { Component, signal } from '@angular/core';
import { UiAfter, UiBefore } from './bugs/ui-not-updating';
import { LeakAfter, LeakBefore } from './bugs/memory-leak';
import { FormAfter, FormBefore } from './bugs/form-validation';
import { RaceAfter, RaceBefore } from './bugs/race-condition';

interface BugCase {
  id: string;
  title: string;
  tag: string;
  symptom: string;
  cause: string;
  fix: string;
  before: string;
  after: string;
}

@Component({
  selector: 'app-root',
  imports: [UiBefore, UiAfter, LeakBefore, LeakAfter, FormBefore, FormAfter, RaceBefore, RaceAfter],
  templateUrl: './app.html',
})
export class App {
  active = signal('ui');

  readonly cases: BugCase[] = [
    {
      id: 'ui', tag: 'Change detection', title: 'Screen does not update after loading data',
      symptom: 'Clicking "Load profile" shows "Loading…" forever, even though the data arrived.',
      cause: 'Modern Angular apps are zoneless. A plain class field changed inside a timer or callback does not tell Angular to re-render.',
      fix: 'Store UI state in signals. Updating a signal automatically schedules a re-render.',
      before: `status = 'Idle';\n\nload() {\n  setTimeout(() => {\n    this.status = 'Loaded';   // ❌ view never updates\n  }, 800);\n}`,
      after: `status = signal('Idle');\n\nload() {\n  setTimeout(() => {\n    this.status.set('Loaded'); // ✅ view re-renders\n  }, 800);\n}`,
    },
    {
      id: 'leak', tag: 'Memory leak', title: 'App gets slower the longer it is used',
      symptom: 'Every time a widget is shown and hidden, another timer keeps running in the background.',
      cause: 'The component subscribes to an interval but never unsubscribes, so the subscription outlives the component.',
      fix: 'Use takeUntilDestroyed() (or the async pipe / toSignal) so subscriptions end with the component.',
      before: `constructor() {\n  interval(1000)\n    .subscribe(() => this.tick()); // ❌ never cleaned up\n}`,
      after: `constructor() {\n  interval(1000)\n    .pipe(takeUntilDestroyed())    // ✅ auto cleanup\n    .subscribe(() => this.tick());\n}`,
    },
    {
      id: 'form', tag: 'Forms', title: 'Invalid data is saved from the form',
      symptom: 'Users can save "abc" as an email or "-5" as an age – bad data reaches the backend.',
      cause: 'The form has no validators and the submit handler does not check validity.',
      fix: 'Use a reactive form with Validators, show clear error messages and disable Save until the form is valid.',
      before: `<input name="email" [(ngModel)]="email" />\n\nsave() {\n  this.api.save(this.email);  // ❌ no checks\n}`,
      after: `form = fb.group({\n  email: ['', [Validators.required, Validators.email]],\n  age:   [0, [Validators.min(18), Validators.max(99)]],\n});\n\nsave() {\n  if (this.form.invalid) return; // ✅ only valid data\n}`,
    },
    {
      id: 'race', tag: 'RxJS', title: 'Search shows results for the wrong word',
      symptom: 'Typing "ang" quickly ends with results for "a", because an older, slower request finished last.',
      cause: 'mergeMap keeps every HTTP request alive, so responses can arrive out of order and overwrite newer ones.',
      fix: 'Use debounceTime to reduce requests and switchMap to cancel outdated ones – only the latest search wins.',
      before: `query$.pipe(\n  mergeMap(q => this.api.search(q)) // ❌ out-of-order results\n)`,
      after: `query$.pipe(\n  debounceTime(250),\n  switchMap(q => this.api.search(q)) // ✅ latest wins\n)`,
    },
  ];

  current() {
    return this.cases.find(c => c.id === this.active())!;
  }
}
