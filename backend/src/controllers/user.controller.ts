import { Request, Response } from 'express';
import { UserService } from '../services/ldap/user.service';

export class UserController {
  
  static async getUser(req: Request, res: Response): Promise<any> {
    try {
      const { username } = req.params;
      const user = await UserService.findUser(username);
      
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
      }
      return res.json({ status: 'success', data: user });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<any> {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ status: 'success', data: users });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async createUser(req: Request, res: Response): Promise<any> {
    try {
      const { username, firstName, lastName, email } = req.body;
      if (!username || !firstName || !lastName) {
        return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios (username, firstName, lastName).' });
      }
      
      await UserService.createUser(username, firstName, lastName, email);
      return res.status(201).json({ status: 'success', message: `Usuario ${username} creado exitosamente.` });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<any> {
    try {
      const { cn } = req.params; // La función pide el CN exacto
      await UserService.deleteUserByCN(cn);
      return res.json({ status: 'success', message: `Usuario ${cn} eliminado exitosamente.` });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
