import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiensComponent } from './liens.component';

describe('LiensComponent', () => {
  let component: LiensComponent;
  let fixture: ComponentFixture<LiensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
