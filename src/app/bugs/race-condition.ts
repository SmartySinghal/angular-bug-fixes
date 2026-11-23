import { Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, delay, filter, mergeMap, of, switchMap } from 'rxjs';

const LANGS = ['Angular', 'AngularJS', 'Ant Design', 'Apollo', 'Astro', 'Babel', 'Bootstrap', 'Next.js', 'Node.js', 'React', 'RxJS', 'Svelte', 'Tailwind', 'TypeScript', 'Vue'];

/** Fake API: shorter queries are SLOWER – exactly what happens with real servers under load. */
function fakeSearch(term: string): Observable<{ term: string; results: string[] }> {
  const results = LANGS.filter(l => l.toLowerCase().startsWith(term.toLowerCase()));
  return of({ term, results }).pipe(delay(Math.max(150, 1300 - term.length * 350)));
}

/** BUG 4 – BEFORE: mergeMap keeps every request, so a slow OLD response can overwrite the newest one. */
@Component({
  selector: 'app-race-before',
  template: `
    <input class="input" placeholder="Type fast: ang" [value]="query()" (input)="query.set($any($event.target).value)" />
    <p class="mt-2 text-sm">Results shown for: <strong [class.text-rose-600]="data().term !== query()">"{{ data().term }}"</strong></p>
    <p class="text-sm text-slate-600">{{ data().results.join(', ') || '—' }}</p>
  `,
})
export class RaceBefore {
  query = signal('');
  data = toSignal(
    toObservable(this.query).pipe(filter(q => q.length > 0), mergeMap(q => fakeSearch(q))),   // ❌ responses arrive out of order
    { initialValue: { term: '', results: [] as string[] } },
  );
}

/** BUG 4 – AFTER: debounce + switchMap cancels outdated requests. */
@Component({
  selector: 'app-race-after',
  template: `
    <input class="input" placeholder="Type fast: ang" [value]="query()" (input)="query.set($any($event.target).value)" />
    <p class="mt-2 text-sm">Results shown for: <strong class="text-emerald-600">"{{ data().term }}"</strong></p>
    <p class="text-sm text-slate-600">{{ data().results.join(', ') || '—' }}</p>
  `,
})
export class RaceAfter {
  query = signal('');
  data = toSignal(
    toObservable(this.query).pipe(filter(q => q.length > 0), debounceTime(250), switchMap(q => fakeSearch(q))),  // ✅ only the latest request wins
    { initialValue: { term: '', results: [] as string[] } },
  );
}
