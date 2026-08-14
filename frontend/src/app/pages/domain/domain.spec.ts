import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Domain } from './domain';
import { DomainService } from '../../core/services/domain.service';
import { of, throwError } from 'rxjs';
import { vi, expect } from 'vitest';

describe('Domain', () => {
  let component: Domain;
  let fixture: ComponentFixture<Domain>;
  let domainServiceMock: any;

  beforeEach(async () => {
    domainServiceMock = {
      getDomainInfo: vi.fn().mockReturnValue(of({ name: 'corp.local' })),
      getDomainStructure: vi.fn().mockReturnValue(of([{ objectName: 'OU=Users' }]))
    };

    await TestBed.configureTestingModule({
      imports: [Domain, HttpClientTestingModule],
      providers: [
        { provide: DomainService, useValue: domainServiceMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Domain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data on init successfully', () => {
    component.fetchData();
    expect(domainServiceMock.getDomainInfo).toHaveBeenCalled();
    expect(domainServiceMock.getDomainStructure).toHaveBeenCalled();
    expect(component.domainInfo.name).toBe('corp.local');
    expect(component.domainStructure.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should handle error when fetching data', () => {
    domainServiceMock.getDomainInfo.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchData();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(component.loading).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should get correct icon for organizationalUnit', () => {
    const entry = { attributes: [{ type: 'objectClass', values: ['top', 'organizationalUnit'] }] };
    expect(component.getIconForClass(entry)).toBe('folder');
  });

  it('should get correct icon for container', () => {
    const entry = { attributes: [{ type: 'objectClass', values: ['top', 'container'] }] };
    expect(component.getIconForClass(entry)).toBe('inventory_2');
  });

  it('should get default icon when no specific class matches', () => {
    const entry = { attributes: [{ type: 'objectClass', values: ['top'] }] };
    expect(component.getIconForClass(entry)).toBe('folder_open');
  });

  it('should get correct name from attributes', () => {
    const entry = { attributes: [{ type: 'name', values: ['Users'] }] };
    expect(component.getName(entry)).toBe('Users');
  });

  it('should fallback to objectName when name attribute is missing', () => {
    const entry = { objectName: 'OU=Custom', attributes: [] };
    expect(component.getName(entry)).toBe('OU=Custom');
  });
});
