import axios from 'axios';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';

import prisma from '../../lib/prisma';
import { ISchool } from '../../typings';

interface Res {
  success: boolean;
  caseId?: string;
  message?: string;
  cases?: { date: Date; classroomNumber: string }[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Res>) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST')
      return res.status(405).send({
        success: false,
        message: 'Only GET and POST requests allowed'
      });

    await prisma.$connect();

    await prisma.cases.updateMany({
      where: {
        active: true,
        secondActive: false,
        createdAt: {
          lt: DateTime.now().minus({ days: 5 }).toJSDate()
        }
      },
      data: { active: false }
    });
    await prisma.cases.updateMany({
      where: {
        active: true,
        secondActive: true,
        createdAt: {
          lt: DateTime.now().minus({ days: 10 }).toJSDate()
        }
      },
      data: { active: false }
    });

    if (req.method === 'POST') {
      const body = await (req.body as Promise<{
        school: string;
        visitorId: string;
        caseIdOrRoomNumber: string;
      }>);
      if (!body.school || !body.visitorId || !body.caseIdOrRoomNumber)
        res.status(400).send({ success: false, message: 'Missing parameters' });
      else {
        const schools = await axios
          .get<ISchool[]>('/data/schools.json', {
            baseURL: process.env.FRONTEND_URL
          })
          .then((res) => res.data);

        const caseId = body.caseIdOrRoomNumber.slice(1);
        const visitor = await axios.get<{ visits: string[] }>(
          `/visitors/${body.visitorId}?token=${process.env.FINGERPRINT_KEY!}`,
          { baseURL: 'https://api.fpjs.io' }
        );

        const selectedSchool = schools.find((s) => s.alias === body.school);
        if (selectedSchool) {
          const isValid = await Yup.lazy(() => {
            return Yup.object().shape({
              caseIdOrRoomNumber: Yup.string()
                .required('Case ID or classroom number is required')
                .min(
                  selectedSchool.min,
                  'Must be a valid case ID or classroom number'
                )
                .max(25, 'Must be a valid case ID or classroom number')
                .matches(
                  new RegExp(
                    `(^#[a-z0-9]{24}$)|${selectedSchool.classroomRegex}`
                  ),
                  'Must be a valid case ID or classroom number'
                )
            });
          }).isValid({ caseIdOrRoomNumber: body.caseIdOrRoomNumber });

          if (isValid) {
            if (visitor.data.visits.length) {
              const schoolCase = await prisma.cases
                .findUnique({
                  where: { id: caseId }
                })
                .catch(() => null);

              if (schoolCase) {
                const preExpireDate = DateTime.fromJSDate(schoolCase.createdAt)
                  .plus({ days: 5 })
                  .toMillis();
                const expireDate = DateTime.fromJSDate(schoolCase.createdAt)
                  .plus({ days: 6 })
                  .toMillis();

                if (preExpireDate > new Date().getTime()) {
                  res.status(400).send({
                    success: false,
                    message:
                      'This case is not older than 5 days. Please wait a full 5 days before renewing the case.'
                  });
                } else if (
                  schoolCase.secondActive ||
                  expireDate < new Date().getTime()
                ) {
                  res.status(400).send({
                    success: false,
                    message:
                      'This case is no longer valid. Please submit a classroom number instead.'
                  });
                } else {
                  await prisma.cases.update({
                    where: { id: caseId },
                    data: { active: true, secondActive: true }
                  });
                  res.status(200).send({ success: true, caseId: '' });
                }
              } else {
                let cases = await prisma.cases.findMany({
                  where: { visitorId: body.visitorId }
                });

                cases = cases.filter((c) => {
                  const expireDate = DateTime.fromJSDate(c.createdAt)
                    .plus({ days: 10 })
                    .toMillis();

                  return expireDate > new Date().getTime();
                });

                if (cases.length < 3) {
                  const schoolCase = await prisma.cases.create({
                    data: {
                      school: body.school,
                      visitorId: body.visitorId,
                      classroomNumber: body.caseIdOrRoomNumber
                    }
                  });

                  res
                    .status(200)
                    .json({ success: true, caseId: `#${schoolCase.id}` });
                } else {
                  res.status(403).send({
                    success: false,
                    message: 'You have too many ongoing cases'
                  });
                }
              }
            } else
              res
                .status(400)
                .send({ success: false, message: 'Invalid visitor' });
          } else
            res
              .status(400)
              .send({ success: false, message: 'Invalid classroom' });
        } else
          res.status(400).send({ success: false, message: 'Invalid school' });
      }
    } else {
      const cases = await prisma.cases.findMany({ where: { active: true } });
      const filteredCases = cases.filter((c) => c.active);

      res.status(200).json({
        success: true,
        cases: filteredCases.map((c) => ({
          school: c.school,
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
