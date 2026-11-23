import { Component, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

/** BUG 3 – BEFORE: no validation, so empty or wrong data gets "saved". */
@Component({
  selector: 'app-form-before',
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="save()" class="space-y-2">
      <input name="email" [(ngModel)]="email" placeholder="Email" class="input" />
      <input name="age" [(ngModel)]="age" placeholder="Age" class="input" />
      <button type="submit" class="btn">Save</button>
    </form>
    @if (result()) { <p class="mt-2 text-sm text-rose-600">Saved: {{ result() }}</p> }
  `,
})
export class FormBefore {
  email = '';
  age = '';
  result = signal('');
  save() {
    // ❌ saves anything – even "abc" as an email or "-5" as an age
    this.result.set(`email="${this.email}", age="${this.age}"`);
  }
}

/** BUG 3 – AFTER: reactive form with validators and clear error messages. */
@Component({
  selector: 'app-form-after',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-2">
      <input formControlName="email" placeholder="Email" class="input" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p class="text-xs text-rose-600">Please enter a valid email.</p>
      }
      <input formControlName="age" type="number" placeholder="Age" class="input" />
      @if (form.controls.age.touched && form.controls.age.invalid) {
        <p class="text-xs text-rose-600">Age must be between 18 and 99.</p>
      }
      <button type="submit" class="btn" [disabled]="form.invalid">Save</button>
    </form>
    @if (result()) { <p class="mt-2 text-sm text-emerald-600">Saved: {{ result() }}</p> }
  `,
})
export class FormAfter {
  private fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    age: [0, [Validators.required, Validators.min(18), Validators.max(99)]],
  });
  result = signal('');
  save() {
    if (this.form.invalid) return;   // ✅ only valid data is saved
    const v = this.form.getRawValue();
    this.result.set(`email="${v.email}", age=${v.age}`);
  }
}
