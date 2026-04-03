import type { WeeklyPlan, WeeklyTemplate } from '../../domain/types';

import {
  createWeeklyTemplateRecord,
  saveWeeklyPlanRecord,
} from './weeklyPlans';

describe('supabase weekly planning', () => {
  const template: WeeklyTemplate = {
    id: 'template-1',
    ownerId: 'user-1',
    days: [
      { day: 'Mondag', tag: 'Vegetariskt' },
      { day: 'Tisdag', tag: 'Fisk' },
    ],
  };

  const plan: WeeklyPlan = {
    id: 'plan-1',
    ownerId: 'user-1',
    days: [
      { day: 'Mondag', tag: 'Vegetariskt', recipeId: 'recipe-1' },
      { day: 'Tisdag', tag: 'Fisk', recipeId: 'recipe-2' },
    ],
  };

  it('stores a weekly template and its day assignments', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({ insert }));
    const client = { from };

    await createWeeklyTemplateRecord(client as never, template);

    expect(from).toHaveBeenNthCalledWith(1, 'weekly_templates');
    expect(insert).toHaveBeenNthCalledWith(1, {
      id: 'template-1',
      owner_id: 'user-1',
    });
    expect(from).toHaveBeenNthCalledWith(2, 'weekly_template_days');
    expect(insert).toHaveBeenNthCalledWith(2, [
      { template_id: 'template-1', day: 'Mondag', tag: 'Vegetariskt' },
      { template_id: 'template-1', day: 'Tisdag', tag: 'Fisk' },
    ]);
  });

  it('stores a generated weekly plan and its selected recipes', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const deleteMatch = jest.fn().mockResolvedValue({ error: null });
    const eq = jest.fn(() => ({ delete: deleteMatch }));
    const from = jest.fn((table: string) => {
      if (table === 'plan_days') {
        return { delete: jest.fn(() => ({ eq: deleteMatch })), insert };
      }

      return { insert };
    });
    const client = { from };

    await saveWeeklyPlanRecord(client as never, plan, template.id);

    expect(from).toHaveBeenCalledWith('weekly_plans');
    expect(insert).toHaveBeenCalledWith({
      id: 'plan-1',
      owner_id: 'user-1',
      template_id: 'template-1',
    });
    expect(from).toHaveBeenCalledWith('plan_days');
  });
});
