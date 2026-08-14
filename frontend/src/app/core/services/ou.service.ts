import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


export interface OU {
  ou: string;
  description?: string;
  distinguishedName: string;
  type: 'ou' | 'user' | 'group' | 'unknown';
  attributes?: any[];
  isDisabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OuService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ous';

  getAllOUs(): Observable<OU[]> {
    return this.http.get<{ status: string, data: any[] }>(this.apiUrl).pipe(
      map(res => res.data.map(ou => {
        const objectClassArray = this.getAttrArray(ou, 'objectClass');
        const objectClass = objectClassArray.join(',').toLowerCase();
        let type: 'ou' | 'user' | 'group' | 'unknown' = 'unknown';
        if (objectClass.includes('organizationalunit')) type = 'ou';
        else if (objectClass.includes('user')) type = 'user';
        else if (objectClass.includes('group')) type = 'group';

        const uac = parseInt(this.getAttr(ou, 'userAccountControl') || '0', 10);
        const isDisabled = !isNaN(uac) && (uac & 2) === 2;

        return {
          ou: this.getAttr(ou, 'ou') || this.getAttr(ou, 'cn') || this.getAttr(ou, 'sAMAccountName'),
          description: this.getAttr(ou, 'description'),
          distinguishedName: this.getAttr(ou, 'distinguishedName'),
          type,
          isDisabled,
          attributes: ou.attributes
        };
      }))
    );
  }

  createOU(name: string, description?: string, parentDN?: string): Observable<any> {
    return this.http.post(this.apiUrl, { name, description, parentDN });
  }

  updateOU(dn: string, description: string): Observable<any> {
    return this.http.put(this.apiUrl, { dn, description });
  }

  deleteOU(dn: string): Observable<any> {
    return this.http.delete(this.apiUrl, { params: { dn } });
  }

  moveObject(oldDN: string, newDN: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/move`, { oldDN, newDN });
  }

  private getAttr(obj: any, attrName: string): string {
    const attr = obj.attributes?.find((a: any) => a.type === attrName);
    return attr?.values?.[0] || '';
  }

  private getAttrArray(obj: any, attrName: string): string[] {
    const attr = obj.attributes?.find((a: any) => a.type === attrName);
    return attr?.values || [];
  }
}
