import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTesterComponent } from './my-tester.component';

describe('MyTesterComponent', () => {
  let component: MyTesterComponent;
  let fixture: ComponentFixture<MyTesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyTesterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
