import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface Res {
  success: boolean;
  message?: string;
  cases?: { date: Date; classroomNumber: string }[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Res>) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res
        .status(405)
        .send({ success: false, message: 'Only POST requests allowed' });
    }

    await prisma.$connect();

    if (req.method === 'POST') {
      const body = await (req.body as Promise<{
        visitorId: string;
        caseIdOrRoomNumber: string;
      }>);
      if (!body.visitorId || !body.caseIdOrRoomNumber)
        res.status(400).send({ success: false, message: 'Missing parameters' });
      else {
        const caseId = body.caseIdOrRoomNumber.slice(1);
        const visitor = await axios.get<{ visits: string[] }>(
          `/visitors/${body.visitorId}?token=${process.env.FINGERPRINT_KEY!}`,
          { baseURL: 'https://api.fpjs.io' }
        );
        if (visitor.data.visits.length) {
          const pdcCase = await prisma.pdcCase
            .findUnique({
              where: { id: caseId }
            })
            .catch(() => null);

          if (pdcCase) {
            const preExpireDate = DateTime.fromJSDate(pdcCase.createdAt)
              .plus({ days: 5 })
              .toMillis();
            const expireDate = DateTime.fromJSDate(pdcCase.createdAt)
              .plus({ days: 6 })
              .toMillis();

            if (preExpireDate > new Date().getTime()) {
              res.status(400).send({
                success: false,
                message:
                  'This case is not older than 5 days. Please wait a full 5 days before renewing the case.'
              });
            } else if (expireDate < new Date().getTime()) {
              res.status(400).send({
                success: false,
                message:
                  'This case is no longer valid. Please submit a classroom number instead.'
              });
            } else {
              await prisma.pdcCase.update({
                where: { id: caseId },
                data: { active: true }
              });
            }
          } else {
            const cases = await prisma.pdcCase.findMany({
              where: { active: true, visitorId: body.visitorId }
            });

            if (cases.length < 3) {
              await prisma.pdcCase.create({
                data: {
                  visitorId: body.visitorId,
                  classroomNumber: body.caseIdOrRoomNumber
                }
              });

              res.status(200).json({ success: true });
            } else {
              res.status(403).send({
                success: false,
                message: 'You have too many ongoing cases'
              });
            }
          }
        } else
          res.status(400).send({ success: false, message: 'Invalid visitor' });
      }
    } else {
      const cases = await prisma.pdcCase.findMany({ where: { active: true } });

      const filteredCases = cases
        .map((c) => {
          const expireDate = DateTime.fromJSDate(c.createdAt)
            .plus({ days: 5 })
            .toMillis();

          if (expireDate > new Date().getTime()) return c;

          void prisma.pdcCase.update({
            where: { id: c.id },
            data: { active: false }
          });
          c.active = false;
          return c;
        })
        .filter((c) => c.active);

      res.status(200).json({
        success: true,
        cases: filteredCases.map((c) => ({
          date: c.createdAt,
          classroomNumber: c.classroomNumber
        }))
      });
    }

    return await prisma.$disconnect();
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export default handler;
