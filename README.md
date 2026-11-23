# 4 Common Angular Bugs – and How to Fix Them

An interactive case study. Each bug has a **live "before" (buggy) demo**, a **live "after" (fixed) demo**, the root cause and the exact code change.

**Live demo:** https://angular-bug-fixes.onrender.com

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | Screen doesn't update after loading data | Plain fields don't trigger rendering in zoneless Angular | Signals |
| 2 | App gets slower over time | Subscriptions never unsubscribed (memory leak) | `takeUntilDestroyed()` |
| 3 | Invalid data saved from a form | No validation | Reactive forms + `Validators` |
| 4 | Search shows results for the wrong word | `mergeMap` lets old responses win (race condition) | `debounceTime` + `switchMap` |

## Tech
Angular 22, RxJS, Reactive Forms, signals, Tailwind CSS 4.

## Run locally
```bash
npm install
npm start
npm test
```
