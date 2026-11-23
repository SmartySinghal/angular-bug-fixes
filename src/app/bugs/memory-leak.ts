import { Component, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

/** Counts how many timers are still running, so the leak is visible on screen. */
@Injectable({ providedIn: 'root' })
export class TimerTracker {
  before = signal(0);
  after = signal(0);
}

@Component({
  selector: 'app-leaky-widget',
  template: `<p class="text-sm">⏱ Widget ticks: {{ ticks() }}</p>`,
})
export class LeakyWidget {
  ticks = signal(0);
  private tracker = inject(TimerTracker);
  constructor() {
    this.tracker.before.update(n => n + 1);
    // ❌ subscription is never cleaned up – it keeps running after the widget is removed
    interval(1000).subscribe(() => this.ticks.update(t => t + 1));
  }
}

@Component({
  selector: 'app-safe-widget',
  template: `<p class="text-sm">⏱ Widget ticks: {{ ticks() }}</p>`,
})
export class SafeWidget {
  ticks = signal(0);
  private tracker = inject(TimerTracker);
  constructor() {
    this.tracker.after.update(n => n + 1);
    inject(DestroyRef).onDestroy(() => this.tracker.after.update(n => n - 1));
    // ✅ automatically unsubscribes when the component is destroyed
    interval(1000).pipe(takeUntilDestroyed()).subscribe(() => this.ticks.update(t => t + 1));
  }
}

@Component({
  selector: 'app-leak-before',
  imports: [LeakyWidget],
  template: `
    <button type="button" (click)="show.set(!show())" class="btn">{{ show() ? 'Hide' : 'Show' }} widget</button>
    <div class="mt-3 min-h-6">@if (show()) { <app-leaky-widget /> }</div>
    <p class="mt-2 text-sm">Timers still running in memory: <strong class="text-rose-600">{{ tracker.before() }}</strong></p>
    <p class="text-xs text-slate-500">Toggle a few times – the number only goes up.</p>
  `,
})
export class LeakBefore {
  show = signal(false);
  tracker = inject(TimerTracker);
}

@Component({
  selector: 'app-leak-after',
  imports: [SafeWidget],
  template: `
    <button type="button" (click)="show.set(!show())" class="btn">{{ show() ? 'Hide' : 'Show' }} widget</button>
    <div class="mt-3 min-h-6">@if (show()) { <app-safe-widget /> }</div>
    <p class="mt-2 text-sm">Timers still running in memory: <strong class="text-emerald-600">{{ tracker.after() }}</strong></p>
    <p class="text-xs text-slate-500">Toggle a few times – it never goes above 1.</p>
  `,
})
export class LeakAfter {
  show = signal(false);
  tracker = inject(TimerTracker);
}
