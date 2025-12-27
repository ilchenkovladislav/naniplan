export interface Plan {
  id?: number
  key: string
  type: 'day' | 'week' | 'month' | 'year'
  content: string
  timestamp: number
}

export type PlanInput = Omit<Plan, 'id'>
export type PlanUpdate = Partial<PlanInput> & { id: number }
