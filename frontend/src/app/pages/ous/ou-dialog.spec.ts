import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OuDialog } from './ou-dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('OuDialog', () => {
  let component: OuDialog;
  let fixture: ComponentFixture<OuDialog>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OuDialog, BrowserAnimationsModule, FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { isEdit: false, parentDN: 'DC=corp', ou: { name: '', description: '' } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OuDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update name on updateName', () => {
    component.updateName('TestOU');
    expect(component.ou().name).toBe('TestOU');
  });

  it('should update description on updateDesc', () => {
    component.updateDesc('Test description');
    expect(component.ou().description).toBe('Test description');
  });
});
