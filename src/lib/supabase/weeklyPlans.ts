import type { SupabaseClient } from '@supabase/supabase-js';

import type { WeeklyPlan, WeeklyTemplate } from '../../domain/types';

export const createWeeklyTemplateRecord = async (
  client: SupabaseClient,
  template: WeeklyTemplate,
) => {
  const { error } = await client.from('weekly_templates').insert({
    id: template.id,
    owner_id: template.ownerId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { error: daysError } = await client.from('weekly_template_days').insert(
    template.days.map((day) => ({
      template_id: template.id,
      day: day.day,
      tag: day.tag,
    })),
  );

  if (daysError) {
    throw new Error(daysError.message);
  }
};

export const saveWeeklyPlanRecord = async (
  client: SupabaseClient,
  plan: WeeklyPlan,
  templateId: string,
) => {
  const { error } = await client.from('weekly_plans').insert({
    id: plan.id,
    owner_id: plan.ownerId,
    template_id: templateId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { error: daysError } = await client.from('plan_days').insert(
    plan.days.map((day) => ({
      plan_id: plan.id,
      day: day.day,
      tag: day.tag,
      recipe_id: day.recipeId ?? null,
    })),
  );

  if (daysError) {
    throw new Error(daysError.message);
  }
};
