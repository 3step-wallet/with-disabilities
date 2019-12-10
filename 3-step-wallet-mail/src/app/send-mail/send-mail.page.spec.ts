import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendMailPage } from './send-mail.page';

describe('SendMailPage', () => {
  let component: SendMailPage;
  let fixture: ComponentFixture<SendMailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendMailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SendMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
