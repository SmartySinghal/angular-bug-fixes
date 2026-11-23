import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('lists four bug case studies', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const app = TestBed.createComponent(App).componentInstance;
    expect(app.cases.length).toBe(4);
    expect(app.current().id).toBe('ui');
  });
});
