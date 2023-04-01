import { TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { AnimalFacade } from './animal/entity-state/animal.facade';
import { AppComponent } from './app.component';
import { Store } from './state-management/core/store';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatCheckboxModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        Store,
        AnimalFacade
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
