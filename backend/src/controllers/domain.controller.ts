import { Request, Response } from 'express';
import { DomainService } from '../services/ldap/domain.service';

export class DomainController {
  
  static async getInfo(req: Request, res: Response): Promise<any> {
    try {
      const info = await DomainService.getDomainInfo();
      if (!info) {
        return res.status(404).json({ status: 'error', message: 'No se encontró la información del dominio.' });
      }
      return res.json({ status: 'success', data: info });
    } catch (error: any) {
      console.error('Error obteniendo el dominio:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async getStructure(req: Request, res: Response): Promise<any> {
    try {
      const structure = await DomainService.getBaseStructure();
      return res.json({ status: 'success', data: structure });
    } catch (error: any) {
      console.error('Error obteniendo la estructura:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
