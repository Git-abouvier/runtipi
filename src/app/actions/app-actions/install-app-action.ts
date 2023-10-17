'use server';

import { z } from 'zod';
import { db } from '@/server/db';
import { action } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { AppServiceClass } from '@/server/services/apps/apps.service';
import { handleActionError } from '../utils/handle-action-error';

const formSchema = z.object({}).catchall(z.any());

const input = z.object({
  id: z.string(),
  form: formSchema,
  exposed: z.boolean().optional(),
  domain: z.string().optional(),
});

/**
 * Given an app id, installs the app.
 */
export const installAppAction = action(input, async ({ id, form, domain, exposed }) => {
  try {
    const appsService = new AppServiceClass(db);

    await appsService.installApp(id, form, exposed, domain);

    revalidatePath('/apps');
    revalidatePath(`/app/${id}`);
    revalidatePath(`/app-store/${id}`);

    return { success: true };
  } catch (e) {
    return handleActionError(e);
  }
});
