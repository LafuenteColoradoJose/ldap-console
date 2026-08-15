import { Request, Response } from 'express';
import { GroupService } from '../services/ldap/group.service';

export class GroupController {
  
  static async getGroup(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.params;
      const group = await GroupService.findGroup(name as string);
      
      if (!group) {
        return res.status(404).json({ status: 'error', message: 'Grupo no encontrado.' });
      }
      return res.json({ status: 'success', data: group });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async getAllGroups(req: Request, res: Response): Promise<any> {
    try {
      const groups = await GroupService.getAllGroups();
      return res.json({ status: 'success', data: groups });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async createGroup(req: Request, res: Response): Promise<any> {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ status: 'error', message: 'El nombre del grupo es obligatorio.' });
      }
      
      await GroupService.createGroup(name, description);
      return res.status(201).json({ status: 'success', message: `Grupo ${name} creado exitosamente.` });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async deleteGroup(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.params;
      await GroupService.deleteGroup(name as string);
      return res.json({ status: 'success', message: `Grupo ${name} eliminado exitosamente.` });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async updateGroup(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.params;
      const { description } = req.body;
      await GroupService.updateGroup(name as string, description);
      return res.json({ status: 'success', message: 'Grupo actualizado correctamente.' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async addMember(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.params;
      const { memberCN } = req.body;
      await GroupService.addMember(name as string, memberCN as string);
      return res.json({ status: 'success', message: 'Miembro añadido correctamente.' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async removeMember(req: Request, res: Response): Promise<any> {
    try {
      const { name, memberCn } = req.params;
      await GroupService.removeMember(name as string, memberCn as string);
      return res.json({ status: 'success', message: 'Miembro eliminado correctamente.' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
