import { Router, Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();
const WAYN_AI_AUTH_URL = process.env.WAYN_AI_AUTH_URL || 'https://wayn-ai-backend-585555077661.asia-northeast3.run.app';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { hospitalId, email, password } = req.body;

  try {
    console.log(`[Auth Gateway] Forwarding login request to ${WAYN_AI_AUTH_URL}`);
    
    // 1. Forward request to WAYN-Ai Central Auth Server
    const response = await axios.post(`${WAYN_AI_AUTH_URL}/api/auth/login`, {
      hospitalId,
      email,
      password,
    });

    if (response.data && (response.data.success || response.data.token)) {
      // 2. Pass response back to frontend
      res.json({
        success: true,
        token: response.data.token || 'mock_token',
        user: response.data.user || { role: 'HOSPITAL_ADMIN', hospitalId },
        message: 'WAYN-Ai 인증 성공'
      });
    } else {
      res.status(401).json({ success: false, message: response.data?.message || '라이선스 또는 계정 인증 실패' });
    }
  } catch (error: any) {
    console.error('[Auth Gateway] WAYN-Ai Auth Error:', error.response?.data || error.message);
    
    // 3. (Optional) Provide fallback for development or let it fail gracefully
    // For robust architecture, an error from WAYN-Ai means the edge server should deny access
    res.status(401).json({
      success: false,
      message: error.response?.data?.message || '본사 서버(WAYN-Ai)와 통신할 수 없습니다.'
    });
  }
});

export default router;
