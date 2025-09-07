export class InteractiveCycleEducationSystem {
  constructor() {
    this.educationEngine = new EducationEngine();
    this.progressTracker = new ProgressTracker();
    this.interactiveElements = new InteractiveElements();
    this.personalizationEngine = new PersonalizationEngine();
    this.knowledgeBase = new KnowledgeBase();
    this.quizSystem = new QuizSystem();
    this.achievementSystem = new AchievementSystem();
    this.adaptiveLearning = new AdaptiveLearning();
  }

  initializeEducationSystem(userData, preferences) {
    const userProfile = this.createEducationProfile(userData, preferences);
    const personalizedPath = this.generateLearningPath(userProfile);
    const currentContent = this.getCurrentContent(personalizedPath);
    
    return {
      userProfile,
      learningPath: personalizedPath,
      currentContent,
      recommendations: this.generateRecommendations(userProfile),
      progress: this.progressTracker.getProgress(userProfile.userId)
    };
  }

  createEducationProfile(userData, preferences) {
    return {
      userId: userData.userId,
      knowledgeLevel: this.assessKnowledgeLevel(userData),
      learningStyle: this.identifyLearningStyle(preferences),
      interests: this.extractInterests(userData, preferences),
      goals: this.identifyLearningGoals(preferences),
      availableTime: preferences.studyTime || 15, // minutes per session
      preferredFormat: preferences.preferredFormat || 'mixed',
      languagePreference: preferences.language || 'en',
      accessibility: preferences.accessibility || {},
      currentPhase: userData.currentCyclePhase || 'unknown',
      experienceLevel: this.determineExperienceLevel(userData)
    };
  }

  generateLearningPath(userProfile) {
    const coreConcepts = this.getCoreConceptsForLevel(userProfile.knowledgeLevel);
    const personalizedTopics = this.getPersonalizedTopics(userProfile);
    const phaseSpecificContent = this.getPhaseSpecificContent(userProfile.currentPhase);
    
    const path = {
      foundation: this.buildFoundationPath(coreConcepts, userProfile),
      intermediate: this.buildIntermediatePath(personalizedTopics, userProfile),
      advanced: this.buildAdvancedPath(userProfile),
      phaseSpecific: phaseSpecificContent,
      interactive: this.buildInteractivePath(userProfile),
      totalEstimatedTime: 0, // Will be calculated
      milestones: []
    };
    
    path.totalEstimatedTime = this.calculatePathTime(path);
    path.milestones = this.createMilestones(path);
    
    return path;
  }

  buildFoundationPath(coreConcepts, userProfile) {
    const foundationModules = [
      {
        id: 'menstrual_cycle_basics',
        title: 'Understanding Your Menstrual Cycle',
        description: 'Learn the fundamentals of the menstrual cycle',
        estimatedTime: 20,
        difficulty: 'beginner',
        content: {
          overview: this.knowledgeBase.getContent('cycle_overview'),
          interactive: {
            type: 'cycle_diagram',
            data: 'interactive_cycle_diagram'
          },
          videos: this.getVideoContent('cycle_basics'),
          quiz: this.quizSystem.generateQuiz('cycle_basics', userProfile.knowledgeLevel)
        },
        prerequisites: [],
        learningObjectives: [
          'Understand the four phases of the menstrual cycle',
          'Learn about hormonal changes throughout the cycle',
          'Recognize normal vs. concerning symptoms'
        ]
      },
      {
        id: 'hormones_and_health',
        title: 'Hormones and Your Health',
        description: 'Explore how hormones affect your body and mind',
        estimatedTime: 25,
        difficulty: 'beginner',
        content: {
          overview: this.knowledgeBase.getContent('hormones_overview'),
          interactive: {
            type: 'hormone_timeline',
            data: 'hormone_fluctuation_chart'
          },
          case_studies: this.getCaseStudies('hormonal_changes'),
          quiz: this.quizSystem.generateQuiz('hormones', userProfile.knowledgeLevel)
        },
        prerequisites: ['menstrual_cycle_basics'],
        learningObjectives: [
          'Identify key reproductive hormones',
          'Understand hormone fluctuations throughout the cycle',
          'Learn how hormones affect mood, energy, and physical symptoms'
        ]
      },
      {
        id: 'tracking_basics',
        title: 'Effective Cycle Tracking',
        description: 'Learn how to track your cycle for better health insights',
        estimatedTime: 30,
        difficulty: 'beginner',
        content: {
          overview: this.knowledgeBase.getContent('tracking_methods'),
          interactive: {
            type: 'tracking_simulator',
            data: 'sample_tracking_data'
          },
          hands_on: this.createHandsOnActivity('basic_tracking'),
          quiz: this.quizSystem.generateQuiz('tracking', userProfile.knowledgeLevel)
        },
        prerequisites: ['menstrual_cycle_basics'],
        learningObjectives: [
          'Learn what to track for optimal insights',
          'Understand different tracking methods',
          'Practice using tracking tools effectively'
        ]
      }
    ];
    
    return this.personalizeModules(foundationModules, userProfile);
  }

  buildIntermediatePath(personalizedTopics, userProfile) {
    const intermediateModules = [
      {
        id: 'fertility_awareness',
        title: 'Fertility Awareness Method',
        description: 'Advanced techniques for understanding your fertile window',
        estimatedTime: 45,
        difficulty: 'intermediate',
        content: {
          overview: this.knowledgeBase.getContent('fertility_awareness'),
          interactive: {
            type: 'fertility_calculator',
            data: 'fertility_prediction_tool'
          },
          practical: this.createPracticalExercises('fertility_tracking'),
          quiz: this.quizSystem.generateQuiz('fertility_awareness', userProfile.knowledgeLevel)
        },
        prerequisites: ['tracking_basics', 'hormones_and_health'],
        learningObjectives: [
          'Master cervical mucus observation',
          'Understand basal body temperature patterns',
          'Learn to identify your fertile window accurately'
        ]
      },
      {
        id: 'symptom_interpretation',
        title: 'Understanding Your Symptoms',
        description: 'Learn to interpret and respond to cycle-related symptoms',
        estimatedTime: 35,
        difficulty: 'intermediate',
        content: {
          overview: this.knowledgeBase.getContent('symptom_guide'),
          interactive: {
            type: 'symptom_checker',
            data: 'symptom_database'
          },
          scenarios: this.createScenarioBasedLearning('symptom_cases'),
          quiz: this.quizSystem.generateQuiz('symptoms', userProfile.knowledgeLevel)
        },
        prerequisites: ['menstrual_cycle_basics'],
        learningObjectives: [
          'Recognize normal vs. concerning symptoms',
          'Understand symptom patterns throughout the cycle',
          'Learn when to seek medical advice'
        ]
      },
      {
        id: 'lifestyle_optimization',
        title: 'Optimizing Health Through Your Cycle',
        description: 'Align lifestyle choices with your menstrual cycle',
        estimatedTime: 40,
        difficulty: 'intermediate',
        content: {
          overview: this.knowledgeBase.getContent('lifestyle_cycle'),
          interactive: {
            type: 'lifestyle_planner',
            data: 'cycle_based_planning'
          },
          actionable: this.createActionablePlans('lifestyle_optimization'),
          quiz: this.quizSystem.generateQuiz('lifestyle', userProfile.knowledgeLevel)
        },
        prerequisites: ['hormones_and_health'],
        learningObjectives: [
          'Learn phase-specific nutrition recommendations',
          'Understand optimal exercise timing',
          'Plan work and social activities around your cycle'
        ]
      }
    ];
    
    return this.personalizeModules(intermediateModules, userProfile);
  }

  buildAdvancedPath(userProfile) {
    const advancedModules = [
      {
        id: 'medical_conditions',
        title: 'Understanding Cycle-Related Conditions',
        description: 'Learn about common conditions affecting menstrual health',
        estimatedTime: 50,
        difficulty: 'advanced',
        content: {
          overview: this.knowledgeBase.getContent('medical_conditions'),
          interactive: {
            type: 'condition_explorer',
            data: 'medical_conditions_database'
          },
          case_studies: this.getMedicalCaseStudies(),
          resources: this.getMedicalResources(),
          quiz: this.quizSystem.generateQuiz('conditions', userProfile.knowledgeLevel)
        },
        prerequisites: ['symptom_interpretation'],
        learningObjectives: [
          'Recognize signs of PCOS, endometriosis, and other conditions',
          'Understand treatment options and their effects',
          'Learn to advocate for your health with providers'
        ]
      },
      {
        id: 'data_analysis',
        title: 'Advanced Data Analysis',
        description: 'Interpret complex patterns in your cycle data',
        estimatedTime: 60,
        difficulty: 'advanced',
        content: {
          overview: this.knowledgeBase.getContent('data_analysis'),
          interactive: {
            type: 'data_analyzer',
            data: 'sample_datasets'
          },
          tools: this.getAnalysisTools(),
          quiz: this.quizSystem.generateQuiz('analysis', userProfile.knowledgeLevel)
        },
        prerequisites: ['tracking_basics', 'symptom_interpretation'],
        learningObjectives: [
          'Identify long-term patterns and trends',
          'Understand statistical concepts in cycle tracking',
          'Use data to optimize health decisions'
        ]
      }
    ];
    
    return this.personalizeModules(advancedModules, userProfile);
  }

  getPhaseSpecificContent(currentPhase) {
    const phaseContent = {
      menstrual: {
        title: 'Menstrual Phase: Rest and Renewal',
        description: 'Understanding and optimizing your menstrual phase',
        content: {
          physiology: this.knowledgeBase.getContent('menstrual_physiology'),
          symptoms: this.knowledgeBase.getContent('menstrual_symptoms'),
          self_care: this.knowledgeBase.getContent('menstrual_self_care'),
          nutrition: this.knowledgeBase.getContent('menstrual_nutrition'),
          exercise: this.knowledgeBase.getContent('menstrual_exercise')
        },
        interactive: {
          type: 'phase_guide',
          activities: [
            'symptom_tracker',
            'self_care_planner',
            'nutrition_guide'
          ]
        },
        tips: [
          'Focus on iron-rich foods to replenish lost nutrients',
          'Gentle exercise like yoga can help with cramps',
          'Prioritize rest and stress reduction'
        ]
      },
      follicular: {
        title: 'Follicular Phase: Energy and Growth',
        description: 'Harness the energy of your follicular phase',
        content: {
          physiology: this.knowledgeBase.getContent('follicular_physiology'),
          energy: this.knowledgeBase.getContent('follicular_energy'),
          planning: this.knowledgeBase.getContent('follicular_planning'),
          nutrition: this.knowledgeBase.getContent('follicular_nutrition'),
          exercise: this.knowledgeBase.getContent('follicular_exercise')
        },
        interactive: {
          type: 'energy_optimizer',
          activities: [
            'goal_setter',
            'workout_planner',
            'project_scheduler'
          ]
        },
        tips: [
          'Great time to start new projects and challenges',
          'Your energy levels are increasing - use it wisely',
          'Focus on protein and complex carbohydrates'
        ]
      },
      ovulation: {
        title: 'Ovulation Phase: Peak Performance',
        description: 'Maximize your potential during ovulation',
        content: {
          physiology: this.knowledgeBase.getContent('ovulation_physiology'),
          fertility: this.knowledgeBase.getContent('fertility_signs'),
          communication: this.knowledgeBase.getContent('ovulation_communication'),
          nutrition: this.knowledgeBase.getContent('ovulation_nutrition'),
          exercise: this.knowledgeBase.getContent('ovulation_exercise')
        },
        interactive: {
          type: 'ovulation_tracker',
          activities: [
            'fertility_monitor',
            'communication_enhancer',
            'performance_optimizer'
          ]
        },
        tips: [
          'Peak time for communication and social activities',
          'Intense workouts are most effective now',
          'Focus on antioxidant-rich foods'
        ]
      },
      luteal: {
        title: 'Luteal Phase: Focus and Preparation',
        description: 'Navigate the luteal phase with confidence',
        content: {
          physiology: this.knowledgeBase.getContent('luteal_physiology'),
          pms: this.knowledgeBase.getContent('pms_management'),
          focus: this.knowledgeBase.getContent('luteal_focus'),
          nutrition: this.knowledgeBase.getContent('luteal_nutrition'),
          exercise: this.knowledgeBase.getContent('luteal_exercise')
        },
        interactive: {
          type: 'luteal_manager',
          activities: [
            'mood_tracker',
            'pms_toolkit',
            'focus_enhancer'
          ]
        },
        tips: [
          'Great time for detailed work and analysis',
          'Manage cravings with balanced meals',
          'Moderate exercise helps with mood stability'
        ]
      }
    };
    
    return phaseContent[currentPhase] || phaseContent.menstrual;
  }

  createInteractiveContent(contentType, data) {
    switch (contentType) {
      case 'cycle_diagram':
        return this.createCycleDiagram(data);
      case 'hormone_timeline':
        return this.createHormoneTimeline(data);
      case 'fertility_calculator':
        return this.createFertilityCalculator(data);
      case 'symptom_checker':
        return this.createSymptomChecker(data);
      case 'tracking_simulator':
        return this.createTrackingSimulator(data);
      default:
        return this.createDefaultInteractive(data);
    }
  }

  createCycleDiagram(data) {
    return {
      type: 'interactive_diagram',
      component: 'CycleDiagramComponent',
      props: {
        phases: [
          {
            name: 'Menstrual',
            days: [1, 2, 3, 4, 5],
            color: '#dc2626',
            description: 'Menstrual flow occurs. Hormone levels are low.',
            symptoms: ['cramping', 'fatigue', 'mood_changes'],
            hormones: { estrogen: 'low', progesterone: 'low', fsh: 'rising' }
          },
          {
            name: 'Follicular',
            days: [6, 7, 8, 9, 10, 11, 12, 13],
            color: '#059669',
            description: 'Follicles develop. Estrogen levels rise.',
            symptoms: ['increased_energy', 'clearer_skin', 'positive_mood'],
            hormones: { estrogen: 'rising', progesterone: 'low', fsh: 'high' }
          },
          {
            name: 'Ovulation',
            days: [14, 15, 16],
            color: '#f59e0b',
            description: 'Egg is released. Peak fertility window.',
            symptoms: ['increased_libido', 'cervical_mucus_changes', 'mild_pain'],
            hormones: { estrogen: 'peak', progesterone: 'starting_rise', lh: 'surge' }
          },
          {
            name: 'Luteal',
            days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
            color: '#7c3aed',
            description: 'Corpus luteum produces progesterone.',
            symptoms: ['pms_symptoms', 'breast_tenderness', 'mood_changes', 'cravings'],
            hormones: { estrogen: 'moderate', progesterone: 'high' }
          }
        ],
        interactions: {
          hover: 'show_phase_details',
          click: 'deep_dive_phase',
          drag: 'adjust_cycle_length'
        },
        animations: {
          hormone_curves: true,
          phase_transitions: true,
          symptom_indicators: true
        }
      }
    };
  }

  createHormoneTimeline(data) {
    return {
      type: 'animated_chart',
      component: 'HormoneTimelineComponent',
      props: {
        hormones: [
          {
            name: 'Estrogen',
            color: '#06b6d4',
            data: this.generateHormoneData('estrogen'),
            description: 'Primary female sex hormone'
          },
          {
            name: 'Progesterone',
            color: '#8b5cf6',
            data: this.generateHormoneData('progesterone'),
            description: 'Hormone that prepares the body for pregnancy'
          },
          {
            name: 'LH',
            color: '#f59e0b',
            data: this.generateHormoneData('lh'),
            description: 'Luteinizing hormone triggers ovulation'
          },
          {
            name: 'FSH',
            color: '#10b981',
            data: this.generateHormoneData('fsh'),
            description: 'Follicle-stimulating hormone promotes egg development'
          }
        ],
        timeline: {
          duration: 28,
          unit: 'days',
          markers: [
            { day: 1, label: 'Period Starts', type: 'period' },
            { day: 14, label: 'Ovulation', type: 'ovulation' },
            { day: 28, label: 'Cycle End', type: 'cycle_end' }
          ]
        },
        interactions: {
          playback_controls: true,
          speed_adjustment: true,
          phase_highlighting: true,
          detailed_tooltips: true
        }
      }
    };
  }

  createFertilityCalculator(data) {
    return {
      type: 'calculator_tool',
      component: 'FertilityCalculatorComponent',
      props: {
        inputs: [
          {
            type: 'number',
            name: 'cycle_length',
            label: 'Average Cycle Length',
            min: 21,
            max: 45,
            default: 28,
            unit: 'days'
          },
          {
            type: 'date',
            name: 'last_period',
            label: 'First Day of Last Period',
            required: true
          },
          {
            type: 'number',
            name: 'luteal_phase_length',
            label: 'Luteal Phase Length (if known)',
            min: 10,
            max: 16,
            default: 14,
            unit: 'days',
            optional: true
          }
        ],
        calculations: {
          fertile_window: 'calculate_fertile_window',
          ovulation_date: 'predict_ovulation',
          next_period: 'predict_next_period',
          conception_probability: 'calculate_conception_odds'
        },
        visualizations: {
          fertility_chart: true,
          probability_curve: true,
          calendar_view: true
        },
        educational_notes: [
          'Fertile window is typically 6 days ending on ovulation day',
          'Sperm can survive up to 5 days in favorable conditions',
          'Predictions are estimates based on average patterns'
        ]
      }
    };
  }

  assessKnowledgeLevel(userData) {
    let score = 0;
    
    // Check tracking history
    if (userData.trackingHistory && userData.trackingHistory.length > 90) score += 30;
    else if (userData.trackingHistory && userData.trackingHistory.length > 30) score += 15;
    
    // Check feature usage
    const advancedFeatures = ['temperature_tracking', 'mucus_tracking', 'mood_correlation'];
    const usedAdvanced = advancedFeatures.filter(feature => 
      userData.usedFeatures && userData.usedFeatures[feature]
    ).length;
    score += usedAdvanced * 15;
    
    // Check accuracy of self-reported cycle length
    if (userData.predictedVsActual && userData.predictedVsActual.accuracy > 0.8) score += 25;
    
    // Check previous education completion
    if (userData.completedEducation) {
      score += userData.completedEducation.length * 5;
    }
    
    if (score >= 80) return 'expert';
    if (score >= 50) return 'intermediate';
    if (score >= 20) return 'novice';
    return 'beginner';
  }

  identifyLearningStyle(preferences) {
    const styles = [];
    
    if (preferences.preferredFormat) {
      if (preferences.preferredFormat.includes('visual')) styles.push('visual');
      if (preferences.preferredFormat.includes('audio')) styles.push('auditory');
      if (preferences.preferredFormat.includes('hands-on')) styles.push('kinesthetic');
      if (preferences.preferredFormat.includes('reading')) styles.push('reading');
    }
    
    // Default to mixed if no preference specified
    return styles.length > 0 ? styles : ['visual', 'kinesthetic'];
  }

  generateRecommendations(userProfile) {
    const recommendations = [];
    
    // Knowledge level based recommendations
    if (userProfile.knowledgeLevel === 'beginner') {
      recommendations.push({
        type: 'foundation',
        title: 'Start with the Basics',
        message: 'Begin with our foundational course on menstrual cycle basics',
        priority: 'high',
        estimatedTime: 20,
        module: 'menstrual_cycle_basics'
      });
    }
    
    // Phase-specific recommendations
    const phaseRec = this.getPhaseSpecificRecommendation(userProfile.currentPhase);
    if (phaseRec) recommendations.push(phaseRec);
    
    // Learning style recommendations
    if (userProfile.learningStyle.includes('visual')) {
      recommendations.push({
        type: 'format',
        title: 'Visual Learning Resources',
        message: 'Check out our interactive diagrams and infographics',
        priority: 'medium',
        format: 'visual'
      });
    }
    
    // Time-based recommendations
    if (userProfile.availableTime < 15) {
      recommendations.push({
        type: 'micro_learning',
        title: 'Quick Learning Bites',
        message: 'Try our 5-minute daily tips perfect for your schedule',
        priority: 'medium',
        format: 'micro'
      });
    }
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  getPhaseSpecificRecommendation(phase) {
    const recommendations = {
      menstrual: {
        type: 'phase_specific',
        title: 'Menstrual Phase Focus',
        message: 'Learn about self-care strategies for your menstrual phase',
        priority: 'high',
        module: 'menstrual_self_care'
      },
      follicular: {
        type: 'phase_specific',
        title: 'Harness Follicular Energy',
        message: 'Discover how to maximize your increasing energy levels',
        priority: 'high',
        module: 'follicular_optimization'
      },
      ovulation: {
        type: 'phase_specific',
        title: 'Peak Performance Time',
        message: 'Learn about fertility signs and peak performance strategies',
        priority: 'high',
        module: 'ovulation_mastery'
      },
      luteal: {
        type: 'phase_specific',
        title: 'Luteal Phase Management',
        message: 'Understand PMS and optimize your luteal phase experience',
        priority: 'high',
        module: 'luteal_wellness'
      }
    };
    
    return recommendations[phase] || null;
  }

  trackProgress(userId, moduleId, progress) {
    return this.progressTracker.updateProgress(userId, moduleId, progress);
  }

  completeModule(userId, moduleId, score) {
    const completion = this.progressTracker.completeModule(userId, moduleId, score);
    const achievements = this.achievementSystem.checkAchievements(userId, completion);
    const recommendations = this.adaptiveLearning.getNextRecommendations(userId, completion);
    
    return {
      completion,
      achievements,
      recommendations,
      nextModule: this.getNextModule(userId, moduleId)
    };
  }

  getNextModule(userId, completedModuleId) {
    const userPath = this.progressTracker.getUserPath(userId);
    const completedModule = this.findModule(completedModuleId);
    
    if (completedModule && completedModule.nextModules) {
      return completedModule.nextModules[0];
    }
    
    // Find next module in sequence
    return this.findNextInSequence(userPath, completedModuleId);
  }

  exportEducationData(userId) {
    return {
      userProfile: this.progressTracker.getUserProfile(userId),
      progress: this.progressTracker.getProgress(userId),
      achievements: this.achievementSystem.getUserAchievements(userId),
      learningPath: this.progressTracker.getUserPath(userId),
      completedModules: this.progressTracker.getCompletedModules(userId),
      timeSpent: this.progressTracker.getTimeSpent(userId),
      preferences: this.progressTracker.getUserPreferences(userId)
    };
  }
}

class EducationEngine {
  constructor() {
    this.contentDatabase = new Map();
    this.templates = this.initializeTemplates();
  }

  generateContent(topic, difficulty, format, userProfile) {
    const baseContent = this.getBaseContent(topic);
    const adaptedContent = this.adaptContentForUser(baseContent, difficulty, userProfile);
    const formattedContent = this.formatContent(adaptedContent, format);
    
    return formattedContent;
  }

  adaptContentForUser(content, difficulty, userProfile) {
    const adapted = { ...content };
    
    // Adjust complexity based on difficulty level
    if (difficulty === 'beginner') {
      adapted.vocabulary = this.simplifyVocabulary(content.vocabulary);
      adapted.concepts = this.addExtraExplanations(content.concepts);
    } else if (difficulty === 'expert') {
      adapted.vocabulary = this.expandVocabulary(content.vocabulary);
      adapted.concepts = this.addAdvancedConcepts(content.concepts);
    }
    
    // Personalize based on user profile
    if (userProfile.currentPhase) {
      adapted.examples = this.addPhaseSpecificExamples(content.examples, userProfile.currentPhase);
    }
    
    return adapted;
  }

  initializeTemplates() {
    return {
      lesson: {
        structure: ['introduction', 'main_content', 'examples', 'practice', 'summary'],
        timing: { introduction: 0.1, main_content: 0.5, examples: 0.2, practice: 0.15, summary: 0.05 }
      },
      interactive: {
        structure: ['setup', 'interaction', 'feedback', 'reflection'],
        elements: ['input', 'visualization', 'calculation', 'result']
      }
    };
  }
}

class ProgressTracker {
  constructor() {
    this.userProgress = new Map();
    this.achievements = new Map();
  }

  updateProgress(userId, moduleId, progress) {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        modules: new Map(),
        totalTime: 0,
        completedModules: [],
        currentStreak: 0,
        longestStreak: 0
      });
    }
    
    const userProgress = this.userProgress.get(userId);
    userProgress.modules.set(moduleId, {
      progress: progress.percentage,
      timeSpent: progress.timeSpent,
      lastAccessed: Date.now(),
      attempts: progress.attempts || 1,
      score: progress.score
    });
    
    userProgress.totalTime += progress.timeSpent;
    this.updateStreak(userId);
    
    return userProgress;
  }

  completeModule(userId, moduleId, score) {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return null;
    
    const completion = {
      moduleId,
      completedAt: Date.now(),
      score,
      attempts: userProgress.modules.get(moduleId)?.attempts || 1,
      timeSpent: userProgress.modules.get(moduleId)?.timeSpent || 0
    };
    
    userProgress.completedModules.push(completion);
    
    // Update module progress to 100%
    userProgress.modules.set(moduleId, {
      ...userProgress.modules.get(moduleId),
      progress: 100,
      completed: true,
      completedAt: Date.now()
    });
    
    return completion;
  }

  getProgress(userId) {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return null;
    
    const totalModules = userProgress.modules.size;
    const completedModules = userProgress.completedModules.length;
    const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    
    return {
      overall: overallProgress,
      completed: completedModules,
      total: totalModules,
      timeSpent: userProgress.totalTime,
      streak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      moduleProgress: Array.from(userProgress.modules.entries())
    };
  }

  updateStreak(userId) {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return;
    
    const today = new Date().toDateString();
    const lastActivity = userProgress.lastActivity;
    
    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastActivityDate === yesterday) {
        userProgress.currentStreak++;
      } else if (lastActivityDate !== today) {
        userProgress.currentStreak = 1;
      }
    } else {
      userProgress.currentStreak = 1;
    }
    
    userProgress.longestStreak = Math.max(userProgress.longestStreak, userProgress.currentStreak);
    userProgress.lastActivity = Date.now();
  }
}

class KnowledgeBase {
  constructor() {
    this.content = this.initializeContent();
    this.multimedia = this.initializeMultimedia();
    this.references = this.initializeReferences();
  }

  getContent(topicId) {
    return this.content[topicId] || null;
  }

  searchContent(query, filters = {}) {
    const results = [];
    
    Object.entries(this.content).forEach(([id, content]) => {
      if (this.matchesQuery(content, query) && this.matchesFilters(content, filters)) {
        results.push({ id, ...content, relevance: this.calculateRelevance(content, query) });
      }
    });
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  initializeContent() {
    return {
      cycle_overview: {
        title: 'Menstrual Cycle Overview',
        summary: 'The menstrual cycle is a monthly series of changes a woman\'s body goes through in preparation for the possibility of pregnancy.',
        content: `
          <h2>The Four Phases of Your Menstrual Cycle</h2>
          <p>Your menstrual cycle is a complex, beautifully orchestrated process that prepares your body for potential pregnancy each month. Understanding these phases helps you better understand your body and optimize your health.</p>
          
          <h3>1. Menstrual Phase (Days 1-5)</h3>
          <p>This is when menstruation occurs. The lining of your uterus (endometrium) sheds, resulting in menstrual flow. Hormone levels are at their lowest.</p>
          
          <h3>2. Follicular Phase (Days 1-13)</h3>
          <p>Overlapping with menstruation, this phase involves the development of follicles in your ovaries. Estrogen levels gradually rise.</p>
          
          <h3>3. Ovulation (Around Day 14)</h3>
          <p>A mature egg is released from the ovary. This is your most fertile time, lasting about 24 hours.</p>
          
          <h3>4. Luteal Phase (Days 15-28)</h3>
          <p>The empty follicle produces progesterone, which maintains the uterine lining. If pregnancy doesn't occur, hormone levels drop and the cycle begins again.</p>
        `,
        difficulty: 'beginner',
        estimatedReadTime: 8,
        keyTerms: ['menstrual cycle', 'phases', 'hormones', 'ovulation', 'endometrium'],
        multimedia: ['cycle_diagram_video', 'hormone_chart'],
        references: ['mayo_clinic_cycle', 'acog_menstruation'],
        lastUpdated: '2024-01-15',
        tags: ['basics', 'physiology', 'education']
      },
      
      hormones_overview: {
        title: 'Understanding Reproductive Hormones',
        summary: 'Learn about the key hormones that control your menstrual cycle and how they affect your body and mind.',
        content: `
          <h2>The Hormone Symphony</h2>
          <p>Your menstrual cycle is controlled by a complex interplay of hormones. Understanding these chemical messengers helps explain many of the changes you experience throughout your cycle.</p>
          
          <h3>Estrogen: The Growth Hormone</h3>
          <p>Estrogen is responsible for the growth and development of female characteristics. During your cycle, it:</p>
          <ul>
            <li>Stimulates the growth of the uterine lining</li>
            <li>Affects mood and energy levels</li>
            <li>Influences skin health and appearance</li>
            <li>Plays a role in bone health</li>
          </ul>
          
          <h3>Progesterone: The Pregnancy Hormone</h3>
          <p>Progesterone prepares your body for pregnancy and:</p>
          <ul>
            <li>Maintains the uterine lining</li>
            <li>Can cause mood changes and PMS symptoms</li>
            <li>Affects body temperature</li>
            <li>Influences sleep patterns</li>
          </ul>
          
          <h3>LH and FSH: The Control Hormones</h3>
          <p>These hormones from your pituitary gland control the cycle:</p>
          <ul>
            <li>FSH stimulates follicle development</li>
            <li>LH triggers ovulation</li>
          </ul>
        `,
        difficulty: 'beginner',
        estimatedReadTime: 12,
        keyTerms: ['estrogen', 'progesterone', 'LH', 'FSH', 'pituitary gland'],
        multimedia: ['hormone_timeline_animation'],
        references: ['endocrine_society_hormones'],
        tags: ['hormones', 'physiology', 'education']
      }
    };
  }

  calculateRelevance(content, query) {
    let relevance = 0;
    const queryLower = query.toLowerCase();
    
    // Check title
    if (content.title.toLowerCase().includes(queryLower)) relevance += 10;
    
    // Check summary
    if (content.summary.toLowerCase().includes(queryLower)) relevance += 5;
    
    // Check key terms
    content.keyTerms.forEach(term => {
      if (term.toLowerCase().includes(queryLower)) relevance += 8;
    });
    
    // Check tags
    content.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) relevance += 3;
    });
    
    return relevance;
  }
}

class QuizSystem {
  constructor() {
    this.questionBank = this.initializeQuestionBank();
    this.quizTemplates = this.initializeQuizTemplates();
  }

  generateQuiz(topic, difficulty, questionCount = 5) {
    const relevantQuestions = this.getQuestionsForTopic(topic, difficulty);
    const selectedQuestions = this.selectQuestions(relevantQuestions, questionCount);
    
    return {
      id: this.generateQuizId(),
      topic,
      difficulty,
      questions: selectedQuestions,
      timeLimit: questionCount * 2, // 2 minutes per question
      passingScore: 70,
      instructions: this.getQuizInstructions(topic, difficulty)
    };
  }

  getQuestionsForTopic(topic, difficulty) {
    return this.questionBank.filter(question => 
      question.topic === topic && 
      (question.difficulty === difficulty || question.difficulty === 'any')
    );
  }

  initializeQuestionBank() {
    return [
      {
        id: 'cycle_basic_001',
        topic: 'cycle_basics',
        difficulty: 'beginner',
        type: 'multiple_choice',
        question: 'How many phases are there in a typical menstrual cycle?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2, // index of correct answer (4)
        explanation: 'The menstrual cycle has four main phases: menstrual, follicular, ovulation, and luteal.',
        points: 1
      },
      {
        id: 'cycle_basic_002',
        topic: 'cycle_basics',
        difficulty: 'beginner',
        type: 'true_false',
        question: 'Ovulation always occurs on day 14 of the cycle.',
        correctAnswer: false,
        explanation: 'While day 14 is average for a 28-day cycle, ovulation timing varies between individuals and cycles.',
        points: 1
      },
      {
        id: 'hormones_001',
        topic: 'hormones',
        difficulty: 'intermediate',
        type: 'multiple_choice',
        question: 'Which hormone triggers ovulation?',
        options: ['Estrogen', 'Progesterone', 'LH (Luteinizing Hormone)', 'FSH'],
        correctAnswer: 2,
        explanation: 'The LH surge triggers the release of the mature egg from the ovary.',
        points: 2
      }
    ];
  }

  generateQuizId() {
    return 'quiz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }
}

class AchievementSystem {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.userAchievements = new Map();
  }

  checkAchievements(userId, completionData) {
    const newAchievements = [];
    
    this.achievements.forEach(achievement => {
      if (!this.hasAchievement(userId, achievement.id) && this.meetsRequirements(userId, achievement, completionData)) {
        this.awardAchievement(userId, achievement);
        newAchievements.push(achievement);
      }
    });
    
    return newAchievements;
  }

  initializeAchievements() {
    return [
      {
        id: 'first_module',
        title: 'Getting Started',
        description: 'Complete your first education module',
        icon: '🌟',
        points: 10,
        requirements: {
          modules_completed: 1
        },
        category: 'progress'
      },
      {
        id: 'cycle_master',
        title: 'Cycle Master',
        description: 'Complete all basic cycle education modules',
        icon: '🎓',
        points: 50,
        requirements: {
          modules_completed: 5,
          topics: ['cycle_basics', 'hormones', 'tracking']
        },
        category: 'knowledge'
      },
      {
        id: 'streak_week',
        title: 'Weekly Warrior',
        description: 'Learn something new every day for a week',
        icon: '🔥',
        points: 25,
        requirements: {
          streak: 7
        },
        category: 'consistency'
      },
      {
        id: 'quiz_ace',
        title: 'Quiz Ace',
        description: 'Score 100% on any quiz',
        icon: '💯',
        points: 20,
        requirements: {
          perfect_quiz: true
        },
        category: 'excellence'
      }
    ];
  }

  hasAchievement(userId, achievementId) {
    const userAchievements = this.userAchievements.get(userId) || [];
    return userAchievements.some(ach => ach.id === achievementId);
  }

  meetsRequirements(userId, achievement, completionData) {
    // This would check if the user meets the achievement requirements
    // Implementation would depend on the specific requirements structure
    return false; // Placeholder
  }
}

class AdaptiveLearning {
  constructor() {
    this.learningModels = new Map();
    this.adaptationRules = this.initializeAdaptationRules();
  }

  getNextRecommendations(userId, completionData) {
    const userModel = this.getUserModel(userId);
    const performance = this.analyzePerformance(completionData);
    const adaptations = this.calculateAdaptations(userModel, performance);
    
    return this.generateRecommendations(adaptations);
  }

  analyzePerformance(completionData) {
    return {
      score: completionData.score,
      timeSpent: completionData.timeSpent,
      attempts: completionData.attempts,
      difficulty: this.assessPerceivedDifficulty(completionData),
      engagement: this.assessEngagement(completionData)
    };
  }

  initializeAdaptationRules() {
    return {
      low_score: {
        condition: 'score < 70',
        action: 'suggest_review',
        parameters: { review_modules: 'related', difficulty: 'decrease' }
      },
      high_score_fast: {
        condition: 'score > 90 && time < expected * 0.8',
        action: 'suggest_advancement',
        parameters: { difficulty: 'increase', skip_basics: true }
      },
      multiple_attempts: {
        condition: 'attempts > 3',
        action: 'suggest_alternative_format',
        parameters: { format: 'interactive', support: 'additional' }
      }
    };
  }
}