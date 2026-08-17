import { Request, Response } from 'express';
import { telemetryService } from '../services/telemetry.service';

export class TelemetryController {
  
  static async registerHeartbeat(req: Request, res: Response) {
    try {
      const { machineName, activeUser } = req.body;
      
      if (!machineName) {
        return res.status(400).json({ error: 'machineName is required' });
      }

      // Extract IP from request
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;

      // Extract only IPv4 if it's an IPv6-mapped IPv4 (e.g. ::ffff:192.168.1.100)
      let cleanIp = ip;
      if (cleanIp && cleanIp.includes('::ffff:')) {
        cleanIp = cleanIp.split('::ffff:')[1];
      }

      await telemetryService.registerHeartbeat(machineName, cleanIp, activeUser || null);

      res.status(200).json({ message: 'Heartbeat registered successfully' });
    } catch (error: any) {
      console.error('Error registering heartbeat:', error);
      res.status(500).json({ error: error.message });
    }
  }

}
