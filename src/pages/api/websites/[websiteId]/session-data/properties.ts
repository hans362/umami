import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getSessionDataProperties } from 'queries';
import * as yup from 'yup';

export interface SessionDataFieldsRequestQuery {
  websiteId: string;
  startAt: string;
  endAt: string;
  propertyName?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().min(yup.ref('startAt')).required(),
    propertyName: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<SessionDataFieldsRequestQuery>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt, propertyName } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getSessionDataProperties(websiteId, { startDate, endDate, propertyName });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
