import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorHomeComponent } from './tutor-home.component';

describe('TutorHomeComponent', () => {
  let component: TutorHomeComponent;
  let fixture: ComponentFixture<TutorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TutorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
