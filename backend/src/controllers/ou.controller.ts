import { Request, Response } from 'express';
import { OuService } from '../services/ldap/ou.service';

export class OuController {
  static async getAllOUs(req: Request, res: Response) {
    try {
      const ous = await OuService.getAllOUs();
      res.json({ status: 'success', data: ous });
    } catch (error: any) {
      console.error('Error al obtener OUs:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async createOU(req: Request, res: Response) {
    try {
      const { name, description, parentDN } = req.body;
      if (!name) {
        return res.status(400).json({ status: 'error', message: 'Falta el nombre de la OU' });
      }

      await OuService.createOU(name, description, parentDN);
      res.status(201).json({ status: 'success', message: 'OU creada correctamente' });
    } catch (error: any) {
      console.error('Error al crear OU:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async updateOU(req: Request, res: Response) {
    try {
      // The dn is passed in the body since URLs with commas/equals can be messy, 
      // but let's allow it in body for simplicity.
      const { dn, description } = req.body;
      if (!dn) {
        return res.status(400).json({ status: 'error', message: 'Falta el DN de la OU' });
      }

      await OuService.updateOU(dn, description || '');
      res.json({ status: 'success', message: 'OU actualizada correctamente' });
    } catch (error: any) {
      console.error('Error al actualizar OU:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async deleteOU(req: Request, res: Response) {
    try {
      // Pass DN via query string to avoid route param issues with commas
      const dn = req.query.dn as string;
      if (!dn) {
        return res.status(400).json({ status: 'error', message: 'Falta el DN de la OU' });
      }

      await OuService.deleteOU(dn);
      res.json({ status: 'success', message: 'OU eliminada correctamente' });
    } catch (error: any) {
      console.error('Error al eliminar OU:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async moveObject(req: Request, res: Response) {
    try {
      const { oldDN, newDN } = req.body;
      if (!oldDN || !newDN) {
        return res.status(400).json({ status: 'error', message: 'Faltan parámetros oldDN o newDN' });
      }

      await OuService.moveObject(oldDN, newDN);
      res.json({ status: 'success', message: 'Objeto movido correctamente' });
    } catch (error: any) {
      console.error('Error al mover objeto:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
