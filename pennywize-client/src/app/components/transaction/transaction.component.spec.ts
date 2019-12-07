import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionComponent } from './transaction.component';
import { FormsModule } from '@angular/forms';
import { Transaction } from 'src/app/models/transaction';

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sould display transaction properties', () => {
    component.transaction = new Transaction({
      id: 'o4gh80ghw408h',
      amount: 348,
      date: new Date(9998340),
      type: 'fgiopeh',
      description: '048ewh0vihcr0'
    });

    fixture.detectChanges();

    const text = element.textContent;

    expect(text).toContain('id: o4gh80ghw408h');
    expect(text).toContain('amount: 348');
    expect(text).toContain('type: fgiopeh');
    expect(text).toContain('description: 048ewh0vihcr0');
  });
});
