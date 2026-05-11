import type { UserProfile, HealthCondition, Habit } from '../types';

const PREDEFINED_CONDITIONS = [
  { id: 'diabetes', name: 'Diabetes' },
  { id: 'hypertension', name: 'Hypertension' },
  { id: 'heart-disease', name: 'Heart Disease' },
  { id: 'asthma', name: 'Asthma' },
  { id: 'arthritis', name: 'Arthritis' },
  { id: 'back-pain', name: 'Back Pain' },
];

const COMMON_CONDITIONS = [
  { id: 'obesity', name: 'Obesity' },
  { id: 'high-cholesterol', name: 'High Cholesterol' },
  { id: 'osteoporosis', name: 'Osteoporosis' },
  { id: 'copd', name: 'COPD' },
  { id: 'thyroid', name: 'Thyroid Disorder' },
  { id: 'kidney', name: 'Kidney Disease' },
  { id: 'liver', name: 'Liver Disease' },
  { id: 'depression', name: 'Depression' },
  { id: 'anxiety', name: 'Anxiety' },
  { id: 'insomnia', name: 'Insomnia' },
];

export const getAllConditions = (): HealthCondition[] => [
  ...PREDEFINED_CONDITIONS,
  ...COMMON_CONDITIONS,
];

export const getConditionById = (id: string): HealthCondition | undefined => {
  return [...PREDEFINED_CONDITIONS, ...COMMON_CONDITIONS].find(c => c.id === id);
};

export const generateHabits = (
  profile: UserProfile,
  conditions: HealthCondition[],
  customConditions: string[]
): Habit[] => {
  const habits: Habit[] = [];
  const conditionIds = conditions.map(c => c.id);
  const hasCondition = (id: string) => conditionIds.includes(id);

  // Universal Habits (All Users)
  habits.push(
    {
      id: 'water',
      name: 'Drink Water',
      icon: 'droplet',
      color: '#00D9FF',
      category: 'recurring',
      intervalMinutes: 120,
      isActive: true,
      streak: 0,
    },
    {
      id: 'movement',
      name: 'Movement Break',
      icon: 'walk',
      color: '#FF6B35',
      category: 'recurring',
      intervalMinutes: profile.age > 50 ? 60 : 90,
      isActive: true,
      streak: 0,
    },
    {
      id: 'eye-rest',
      name: 'Eye Rest',
      icon: 'eye',
      color: '#00FF88',
      category: 'recurring',
      intervalMinutes: 45,
      isActive: true,
      streak: 0,
    },
    {
      id: 'morning-walk',
      name: 'Morning Walk',
      icon: 'sunrise',
      color: '#FFD93D',
      category: 'daily',
      scheduledTime: '07:00',
      isActive: true,
      streak: 0,
    },
    {
      id: 'stand-stretch',
      name: 'Stand & Stretch',
      icon: 'stretch',
      color: '#FF6B35',
      category: 'daily',
      scheduledTime: '11:00',
      isActive: true,
      streak: 0,
    },
    {
      id: 'evening-walk',
      name: 'Evening Walk',
      icon: 'sunset',
      color: '#FFD93D',
      category: 'daily',
      scheduledTime: '18:00',
      isActive: true,
      streak: 0,
    },
    {
      id: 'posture-check',
      name: 'Posture Check',
      icon: 'user-check',
      color: '#00D9FF',
      category: 'recurring',
      intervalMinutes: 30,
      isActive: true,
      streak: 0,
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: 'lotus',
      color: '#A855F7',
      category: 'daily',
      scheduledTime: '20:00',
      isActive: true,
      streak: 0,
    },
    {
      id: 'sleep-time',
      name: 'Sleep on Time',
      icon: 'moon',
      color: '#6366F1',
      category: 'daily',
      scheduledTime: '22:00',
      isActive: true,
      streak: 0,
    }
  );

  // Age-specific habits
  if (profile.age < 60) {
    habits.push({
      id: 'stretching',
      name: 'Stretching',
      icon: 'activity',
      color: '#00FF88',
      category: 'daily',
      scheduledTime: '06:30',
      isActive: true,
      streak: 0,
    });
  }

  // Power Nap (age 18-60, no heart disease)
  if (profile.age >= 18 && profile.age <= 60 && !hasCondition('heart-disease')) {
    habits.push({
      id: 'power-nap',
      name: 'Power Nap',
      icon: 'bed',
      color: '#A855F7',
      category: 'daily',
      scheduledTime: '13:00',
      isActive: true,
      streak: 0,
    });
  }

  // Condition-Specific Habits
  if (hasCondition('diabetes')) {
    habits.push(
      {
        id: 'blood-sugar',
        name: 'Blood Sugar Check',
        icon: 'droplets',
        color: '#EF4444',
        category: 'daily',
        scheduledTime: '08:00',
        isActive: true,
        streak: 0,
        conditionId: 'diabetes',
      },
      {
        id: 'medication-diabetes',
        name: 'Medication Reminder',
        icon: 'pill',
        color: '#EF4444',
        category: 'daily',
        scheduledTime: '09:00',
        isActive: true,
        streak: 0,
        conditionId: 'diabetes',
      },
      {
        id: 'hydration-check',
        name: 'Hydration Check',
        icon: 'glass-water',
        color: '#00D9FF',
        category: 'recurring',
        intervalMinutes: 60,
        isActive: true,
        streak: 0,
        conditionId: 'diabetes',
      }
    );
  }

  if (hasCondition('hypertension')) {
    habits.push(
      {
        id: 'blood-pressure',
        name: 'Blood Pressure Check',
        icon: 'heart-pulse',
        color: '#EF4444',
        category: 'daily',
        scheduledTime: '07:30',
        isActive: true,
        streak: 0,
        conditionId: 'hypertension',
      },
      {
        id: 'low-sodium',
        name: 'Low Sodium Meal',
        icon: 'utensils',
        color: '#FFD93D',
        category: 'daily',
        scheduledTime: '12:00',
        isActive: true,
        streak: 0,
        conditionId: 'hypertension',
      },
      {
        id: 'breathing-exercise',
        name: 'Breathing Exercise',
        icon: 'wind',
        color: '#00FF88',
        category: 'recurring',
        intervalMinutes: 180,
        isActive: true,
        streak: 0,
        conditionId: 'hypertension',
      }
    );
  }

  if (hasCondition('heart-disease')) {
    habits.push(
      {
        id: 'light-exercise',
        name: 'Light Exercise',
        icon: 'heart',
        color: '#EF4444',
        category: 'daily',
        scheduledTime: '09:00',
        isActive: true,
        streak: 0,
        conditionId: 'heart-disease',
      },
      {
        id: 'rest-breathing',
        name: 'Rest & Breathing',
        icon: 'lungs',
        color: '#00D9FF',
        category: 'recurring',
        intervalMinutes: 120,
        isActive: true,
        streak: 0,
        conditionId: 'heart-disease',
      }
    );
  }

  if (hasCondition('asthma')) {
    habits.push(
      {
        id: 'check-inhaler',
        name: 'Check Inhaler',
        icon: 'spray-can',
        color: '#00D9FF',
        category: 'daily',
        scheduledTime: '08:00',
        isActive: true,
        streak: 0,
        conditionId: 'asthma',
      },
      {
        id: 'outdoor-check',
        name: 'Outdoor Activity Check',
        icon: 'cloud-sun',
        color: '#FFD93D',
        category: 'daily',
        scheduledTime: '10:00',
        isActive: true,
        streak: 0,
        conditionId: 'asthma',
      }
    );
  }

  if (hasCondition('arthritis')) {
    habits.push(
      {
        id: 'joint-movement',
        name: 'Gentle Joint Movement',
        icon: 'rotate-cw',
        color: '#00FF88',
        category: 'recurring',
        intervalMinutes: 60,
        isActive: true,
        streak: 0,
        conditionId: 'arthritis',
      },
      {
        id: 'joint-exercise',
        name: 'Joint-Friendly Exercise',
        icon: 'person-standing',
        color: '#00D9FF',
        category: 'daily',
        scheduledTime: '10:00',
        isActive: true,
        streak: 0,
        conditionId: 'arthritis',
      }
    );
  }

  if (hasCondition('back-pain')) {
    habits.push(
      {
        id: 'back-stretch',
        name: 'Back Stretch',
        icon: 'move-vertical',
        color: '#00FF88',
        category: 'recurring',
        intervalMinutes: 90,
        isActive: true,
        streak: 0,
        conditionId: 'back-pain',
      },
      {
        id: 'posture-reminder',
        name: 'Posture Reminder',
        icon: 'user-check',
        color: '#FFD93D',
        category: 'recurring',
        intervalMinutes: 30,
        isActive: true,
        streak: 0,
        conditionId: 'back-pain',
      }
    );
  }

  if (hasCondition('obesity')) {
    habits.push(
      {
        id: 'light-activity',
        name: 'Light Activity',
        icon: 'footprints',
        color: '#00FF88',
        category: 'recurring',
        intervalMinutes: 60,
        isActive: true,
        streak: 0,
        conditionId: 'obesity',
      },
      {
        id: 'healthy-snack',
        name: 'Healthy Snack Check',
        icon: 'apple',
        color: '#00D9FF',
        category: 'daily',
        scheduledTime: '15:00',
        isActive: true,
        streak: 0,
        conditionId: 'obesity',
      }
    );
  }

  if (hasCondition('depression')) {
    habits.push(
      {
        id: 'mood-check',
        name: 'Mood Check-In',
        icon: 'smile',
        color: '#FFD93D',
        category: 'daily',
        scheduledTime: '09:00',
        isActive: true,
        streak: 0,
        conditionId: 'depression',
      },
      {
        id: 'exercise-depression',
        name: 'Light Exercise',
        icon: 'walk',
        color: '#00FF88',
        category: 'daily',
        scheduledTime: '16:00',
        isActive: true,
        streak: 0,
        conditionId: 'depression',
      },
      {
        id: 'social-activity',
        name: 'Social Activity',
        icon: 'users',
        color: '#A855F7',
        category: 'daily',
        scheduledTime: '18:00',
        isActive: true,
        streak: 0,
        conditionId: 'depression',
      }
    );
  }

  if (hasCondition('anxiety')) {
    habits.push(
      {
        id: 'deep-breathing',
        name: 'Deep Breathing',
        icon: 'wind',
        color: '#00D9FF',
        category: 'recurring',
        intervalMinutes: 120,
        isActive: true,
        streak: 0,
        conditionId: 'anxiety',
      },
      {
        id: 'anxiety-check',
        name: 'Anxiety Check-In',
        icon: 'brain',
        color: '#FFD93D',
        category: 'daily',
        scheduledTime: '11:00',
        isActive: true,
        streak: 0,
        conditionId: 'anxiety',
      },
      {
        id: 'relaxation',
        name: 'Relaxation Time',
        icon: 'coffee',
        color: '#A855F7',
        category: 'daily',
        scheduledTime: '19:00',
        isActive: true,
        streak: 0,
        conditionId: 'anxiety',
      }
    );
  }

  if (hasCondition('insomnia')) {
    habits.push(
      {
        id: 'sleep-routine',
        name: 'Sleep Routine',
        icon: 'bed-double',
        color: '#6366F1',
        category: 'daily',
        scheduledTime: '21:00',
        isActive: true,
        streak: 0,
        conditionId: 'insomnia',
      },
      {
        id: 'screen-free',
        name: 'Screen-Free Time',
        icon: 'monitor-off',
        color: '#6366F1',
        category: 'daily',
        scheduledTime: '20:30',
        isActive: true,
        streak: 0,
        conditionId: 'insomnia',
      },
      {
        id: 'relax-bed',
        name: 'Relaxation Before Bed',
        icon: 'music',
        color: '#A855F7',
        category: 'daily',
        scheduledTime: '21:30',
        isActive: true,
        streak: 0,
        conditionId: 'insomnia',
      }
    );
  }

  // Custom conditions
  customConditions.forEach((condition, index) => {
    habits.push(
      {
        id: `custom-check-${index}`,
        name: `${condition} Check-In`,
        icon: 'stethoscope',
        color: '#00D9FF',
        category: 'daily',
        scheduledTime: '09:00',
        isActive: true,
        streak: 0,
      },
      {
        id: `custom-doctor-${index}`,
        name: 'Consult Doctor',
        icon: 'user-md',
        color: '#FFD93D',
        category: 'daily',
        scheduledTime: '10:00',
        isActive: true,
        streak: 0,
      }
    );
  });

  return habits;
};
