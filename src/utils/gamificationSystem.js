export class GamificationSystem {
  constructor() {
    this.achievementEngine = new AchievementEngine();
    this.progressTracker = new ProgressTracker();
    this.rewardSystem = new RewardSystem();
    this.challengeManager = new ChallengeManager();
    this.socialFeatures = new SocialFeatures();
    this.streakManager = new StreakManager();
    this.levelingSystem = new LevelingSystem();
    this.badgeSystem = new BadgeSystem();
  }

  initializeGamification(userData) {
    const userProfile = this.createGamificationProfile(userData);
    const currentProgress = this.progressTracker.initialize(userProfile);
    const availableChallenges = this.challengeManager.getAvailableChallenges(userProfile);
    const achievements = this.achievementEngine.getEarnedAchievements(userProfile.userId);
    
    return {
      userProfile,
      currentProgress,
      availableChallenges,
      achievements,
      streaks: this.streakManager.getCurrentStreaks(userProfile.userId),
      level: this.levelingSystem.getCurrentLevel(userProfile.userId),
      nextRewards: this.rewardSystem.getUpcomingRewards(userProfile.userId)
    };
  }

  createGamificationProfile(userData) {
    return {
      userId: userData.userId,
      joinDate: userData.joinDate || Date.now(),
      trackingConsistency: this.calculateConsistency(userData),
      engagementLevel: this.calculateEngagement(userData),
      preferences: {
        competitiveMode: userData.preferences?.competitive || false,
        publicProgress: userData.preferences?.publicProgress || false,
        challengeDifficulty: userData.preferences?.difficulty || 'medium',
        preferredRewards: userData.preferences?.rewards || ['badges', 'insights'],
        socialFeatures: userData.preferences?.social || false
      },
      currentGoals: userData.goals || [],
      personalBests: this.extractPersonalBests(userData),
      motivationalProfile: this.assessMotivationalProfile(userData)
    };
  }

  logTrackingActivity(userId, activityData) {
    const activity = {
      userId,
      type: activityData.type,
      timestamp: Date.now(),
      data: activityData.data,
      quality: this.assessActivityQuality(activityData),
      consistency: this.updateConsistency(userId, activityData)
    };

    // Update progress tracking
    const progressUpdate = this.progressTracker.updateProgress(userId, activity);
    
    // Check for streak updates
    const streakUpdate = this.streakManager.updateStreaks(userId, activity);
    
    // Check for achievements
    const newAchievements = this.achievementEngine.checkAchievements(userId, activity, progressUpdate);
    
    // Check for level progression
    const levelUpdate = this.levelingSystem.updateLevel(userId, progressUpdate);
    
    // Generate rewards
    const rewards = this.rewardSystem.calculateRewards(userId, {
      activity,
      progressUpdate,
      streakUpdate,
      newAchievements,
      levelUpdate
    });

    // Update challenges
    const challengeUpdates = this.challengeManager.updateChallenges(userId, activity);

    return {
      activity,
      progressUpdate,
      streakUpdate,
      newAchievements,
      levelUpdate,
      rewards,
      challengeUpdates,
      encouragement: this.generateEncouragement(userId, progressUpdate)
    };
  }

  assessActivityQuality(activityData) {
    let quality = 1.0;
    
    // Completeness scoring
    const requiredFields = this.getRequiredFields(activityData.type);
    const completedFields = Object.keys(activityData.data || {});
    const completeness = completedFields.length / requiredFields.length;
    quality *= completeness;
    
    // Timeliness scoring
    const timeSinceActivity = Date.now() - (activityData.timestamp || Date.now());
    const hoursDelay = timeSinceActivity / (1000 * 60 * 60);
    if (hoursDelay < 4) quality *= 1.0;
    else if (hoursDelay < 24) quality *= 0.9;
    else quality *= 0.7;
    
    // Detail level scoring
    if (activityData.data?.notes && activityData.data.notes.length > 20) quality += 0.1;
    if (activityData.data?.photos && activityData.data.photos.length > 0) quality += 0.1;
    
    return Math.min(1.2, Math.max(0.3, quality));
  }

  generateEncouragement(userId, progressUpdate) {
    const userProfile = this.getUserProfile(userId);
    const motivationalProfile = userProfile.motivationalProfile;
    const currentStreak = this.streakManager.getCurrentStreak(userId, 'daily_tracking');
    
    const encouragements = [];
    
    // Streak-based encouragement
    if (currentStreak >= 7) {
      encouragements.push({
        type: 'streak_celebration',
        message: `🔥 Amazing ${currentStreak}-day streak! You're building incredible consistency!`,
        tone: 'celebratory',
        action: 'keep_it_up'
      });
    } else if (currentStreak >= 3) {
      encouragements.push({
        type: 'streak_building',
        message: `Great job! ${currentStreak} days in a row. Keep the momentum going!`,
        tone: 'encouraging',
        action: 'continue_streak'
      });
    }
    
    // Progress-based encouragement
    const weeklyProgress = progressUpdate.weeklyCompletion;
    if (weeklyProgress >= 0.8) {
      encouragements.push({
        type: 'progress_excellent',
        message: `You're crushing it this week! ${Math.round(weeklyProgress * 100)}% completion rate.`,
        tone: 'proud',
        action: 'maintain_excellence'
      });
    } else if (weeklyProgress >= 0.5) {
      encouragements.push({
        type: 'progress_good',
        message: `Solid progress this week! You're at ${Math.round(weeklyProgress * 100)}% - every entry counts.`,
        tone: 'supportive',
        action: 'gentle_push'
      });
    } else {
      encouragements.push({
        type: 'progress_gentle',
        message: `Every step counts! Even one entry today makes a difference in understanding your cycle.`,
        tone: 'gentle',
        action: 'motivation'
      });
    }
    
    // Personalized based on motivational profile
    if (motivationalProfile.type === 'achiever') {
      encouragements.push({
        type: 'achievement_focused',
        message: `You're only ${progressUpdate.pointsToNextLevel} points away from leveling up!`,
        tone: 'goal_oriented',
        action: 'level_progress'
      });
    } else if (motivationalProfile.type === 'learner') {
      encouragements.push({
        type: 'insight_focused',
        message: `Your consistent tracking is revealing fascinating patterns about your unique cycle!`,
        tone: 'discovery',
        action: 'view_insights'
      });
    }
    
    return this.selectBestEncouragement(encouragements, motivationalProfile);
  }

  createChallenge(userId, challengeType, difficulty = 'medium') {
    const challengeTemplates = this.challengeManager.getTemplates();
    const template = challengeTemplates[challengeType];
    
    if (!template) {
      throw new Error(`Unknown challenge type: ${challengeType}`);
    }
    
    const challenge = {
      id: this.generateChallengeId(),
      userId,
      type: challengeType,
      title: template.title,
      description: this.personalizeDescription(template.description, userId),
      difficulty,
      startDate: Date.now(),
      endDate: Date.now() + template.duration,
      requirements: this.scaleChallengeRequirements(template.requirements, difficulty),
      rewards: this.scaleChallengeRewards(template.rewards, difficulty),
      progress: {
        current: 0,
        target: template.requirements.target,
        milestones: template.milestones || []
      },
      status: 'active'
    };
    
    this.challengeManager.addChallenge(userId, challenge);
    return challenge;
  }

  joinSocialChallenge(userId, challengeId) {
    const challenge = this.socialFeatures.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    const participation = {
      userId,
      challengeId,
      joinedAt: Date.now(),
      progress: 0,
      ranking: null,
      teamId: challenge.type === 'team' ? this.assignToTeam(userId, challengeId) : null
    };
    
    this.socialFeatures.addParticipant(challengeId, participation);
    
    return {
      challenge,
      participation,
      currentRanking: this.socialFeatures.getCurrentRanking(challengeId),
      encouragement: this.generateSocialEncouragement(challenge, participation)
    };
  }

  getGamificationDashboard(userId) {
    const userProfile = this.getUserProfile(userId);
    const currentLevel = this.levelingSystem.getCurrentLevel(userId);
    const achievements = this.achievementEngine.getEarnedAchievements(userId);
    const activeStreaks = this.streakManager.getActiveStreaks(userId);
    const activeChallenges = this.challengeManager.getActiveChallenges(userId);
    const recentRewards = this.rewardSystem.getRecentRewards(userId);
    const socialStats = this.socialFeatures.getUserStats(userId);
    
    return {
      overview: {
        level: currentLevel.level,
        experience: currentLevel.experience,
        nextLevelProgress: currentLevel.progressToNext,
        totalAchievements: achievements.length,
        activeStreaks: activeStreaks.length,
        activeChallenges: activeChallenges.length
      },
      streaks: this.formatStreaksForDashboard(activeStreaks),
      achievements: this.formatAchievementsForDashboard(achievements.slice(-5)), // Recent 5
      challenges: this.formatChallengesForDashboard(activeChallenges),
      rewards: this.formatRewardsForDashboard(recentRewards.slice(-3)), // Recent 3
      social: socialStats,
      insights: this.generateGamificationInsights(userId),
      recommendations: this.generateGamificationRecommendations(userId)
    };
  }

  generateGamificationInsights(userId) {
    const trackingData = this.progressTracker.getTrackingData(userId);
    const insights = [];
    
    // Consistency insights
    const consistency = this.calculateWeeklyConsistency(trackingData);
    if (consistency >= 0.8) {
      insights.push({
        type: 'consistency_excellent',
        message: 'Your tracking consistency is excellent! This dedication is paying off with better predictions.',
        impact: 'high',
        category: 'consistency'
      });
    } else if (consistency >= 0.5) {
      insights.push({
        type: 'consistency_improving',
        message: 'Your consistency is improving. Try setting a daily reminder to maintain momentum.',
        impact: 'medium',
        category: 'consistency',
        suggestion: 'set_daily_reminder'
      });
    }
    
    // Achievement velocity insights
    const recentAchievements = this.achievementEngine.getRecentAchievements(userId, 30); // Last 30 days
    if (recentAchievements.length >= 3) {
      insights.push({
        type: 'achievement_velocity',
        message: `You've earned ${recentAchievements.length} achievements this month! You're on fire!`,
        impact: 'high',
        category: 'achievement'
      });
    }
    
    // Social insights
    if (this.socialFeatures.isActive(userId)) {
      const socialRanking = this.socialFeatures.getUserRanking(userId);
      if (socialRanking && socialRanking.percentile >= 0.8) {
        insights.push({
          type: 'social_leadership',
          message: `You're in the top ${Math.round((1 - socialRanking.percentile) * 100)}% of active users! Others look up to your consistency.`,
          impact: 'high',
          category: 'social'
        });
      }
    }
    
    return insights.slice(0, 3); // Return top 3 insights
  }

  exportGamificationData(userId) {
    return {
      userProfile: this.getUserProfile(userId),
      level: this.levelingSystem.getCurrentLevel(userId),
      totalExperience: this.levelingSystem.getTotalExperience(userId),
      achievements: this.achievementEngine.getAllAchievements(userId),
      badges: this.badgeSystem.getUserBadges(userId),
      streaks: this.streakManager.getAllStreaks(userId),
      challenges: {
        completed: this.challengeManager.getCompletedChallenges(userId),
        active: this.challengeManager.getActiveChallenges(userId)
      },
      rewards: this.rewardSystem.getAllRewards(userId),
      socialStats: this.socialFeatures.getUserStats(userId),
      progressHistory: this.progressTracker.getProgressHistory(userId),
      personalBests: this.getPersonalBests(userId),
      milestones: this.getMilestones(userId)
    };
  }
}

class AchievementEngine {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.userAchievements = new Map();
    this.achievementCategories = this.initializeCategories();
  }

  initializeAchievements() {
    return [
      // Tracking Consistency Achievements
      {
        id: 'first_entry',
        title: 'Getting Started',
        description: 'Log your first cycle data',
        icon: '🌟',
        category: 'milestones',
        difficulty: 'easy',
        points: 10,
        requirements: { entries: 1 },
        rarity: 'common'
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Track consistently for 7 days in a row',
        icon: '🔥',
        category: 'consistency',
        difficulty: 'medium',
        points: 50,
        requirements: { daily_streak: 7 },
        rarity: 'uncommon'
      },
      {
        id: 'month_master',
        title: 'Month Master',
        description: 'Complete a full month of daily tracking',
        icon: '📅',
        category: 'consistency',
        difficulty: 'hard',
        points: 200,
        requirements: { daily_streak: 30 },
        rarity: 'rare',
        rewards: ['custom_theme', 'advanced_analytics']
      },
      {
        id: 'century_tracker',
        title: 'Century Tracker',
        description: 'Reach 100 days of consistent tracking',
        icon: '💯',
        category: 'consistency',
        difficulty: 'legendary',
        points: 1000,
        requirements: { daily_streak: 100 },
        rarity: 'legendary',
        rewards: ['exclusive_badge', 'priority_support', 'beta_features']
      },

      // Data Quality Achievements
      {
        id: 'detail_devotee',
        title: 'Detail Devotee',
        description: 'Add notes to 25 entries',
        icon: '📝',
        category: 'quality',
        difficulty: 'medium',
        points: 75,
        requirements: { entries_with_notes: 25 },
        rarity: 'uncommon'
      },
      {
        id: 'photo_professional',
        title: 'Photo Professional',
        description: 'Upload photos for 10 symptom entries',
        icon: '📸',
        category: 'quality',
        difficulty: 'medium',
        points: 100,
        requirements: { entries_with_photos: 10 },
        rarity: 'uncommon'
      },
      {
        id: 'comprehensive_chronicler',
        title: 'Comprehensive Chronicler',
        description: 'Track all available data types in one cycle',
        icon: '📊',
        category: 'quality',
        difficulty: 'hard',
        points: 300,
        requirements: { 
          complete_cycle: true,
          data_types: ['symptoms', 'mood', 'flow', 'temperature', 'exercise', 'sleep']
        },
        rarity: 'rare'
      },

      // Learning & Education Achievements
      {
        id: 'curious_learner',
        title: 'Curious Learner',
        description: 'Complete your first educational module',
        icon: '🎓',
        category: 'education',
        difficulty: 'easy',
        points: 25,
        requirements: { education_modules: 1 },
        rarity: 'common'
      },
      {
        id: 'quiz_master',
        title: 'Quiz Master',
        description: 'Score 100% on any educational quiz',
        icon: '🏆',
        category: 'education',
        difficulty: 'medium',
        points: 75,
        requirements: { perfect_quiz: true },
        rarity: 'uncommon'
      },
      {
        id: 'cycle_scholar',
        title: 'Cycle Scholar',
        description: 'Complete all basic education modules',
        icon: '🎯',
        category: 'education',
        difficulty: 'hard',
        points: 250,
        requirements: { education_modules: 10, topics: ['basics', 'hormones', 'tracking', 'health'] },
        rarity: 'rare'
      },

      // Health & Wellness Achievements  
      {
        id: 'symptom_sleuth',
        title: 'Symptom Sleuth',
        description: 'Track symptoms for 50 different days',
        icon: '🔍',
        category: 'health',
        difficulty: 'medium',
        points: 100,
        requirements: { symptom_tracking_days: 50 },
        rarity: 'uncommon'
      },
      {
        id: 'mood_mapper',
        title: 'Mood Mapper',
        description: 'Track mood for 30 consecutive days',
        icon: '😊',
        category: 'health',
        difficulty: 'medium',
        points: 150,
        requirements: { mood_streak: 30 },
        rarity: 'uncommon'
      },
      {
        id: 'wellness_warrior',
        title: 'Wellness Warrior',
        description: 'Maintain consistent sleep, exercise, and nutrition tracking for 14 days',
        icon: '💪',
        category: 'health',
        difficulty: 'hard',
        points: 300,
        requirements: { 
          wellness_streak: 14,
          categories: ['sleep', 'exercise', 'nutrition']
        },
        rarity: 'rare'
      },

      // Prediction & Analysis Achievements
      {
        id: 'prediction_pioneer',
        title: 'Prediction Pioneer',
        description: 'Enable cycle predictions for the first time',
        icon: '🔮',
        category: 'analysis',
        difficulty: 'easy',
        points: 25,
        requirements: { predictions_enabled: true },
        rarity: 'common'
      },
      {
        id: 'accuracy_ace',
        title: 'Accuracy Ace',
        description: 'Achieve 90% prediction accuracy over 3 cycles',
        icon: '🎯',
        category: 'analysis',
        difficulty: 'hard',
        points: 400,
        requirements: { 
          prediction_accuracy: 0.9,
          cycles: 3
        },
        rarity: 'rare'
      },
      {
        id: 'pattern_pro',
        title: 'Pattern Pro',
        description: 'Identify and track 5 personal cycle patterns',
        icon: '📈',
        category: 'analysis',
        difficulty: 'medium',
        points: 200,
        requirements: { identified_patterns: 5 },
        rarity: 'uncommon'
      },

      // Social & Community Achievements
      {
        id: 'community_contributor',
        title: 'Community Contributor',
        description: 'Share insights that help 10 other users',
        icon: '🤝',
        category: 'social',
        difficulty: 'medium',
        points: 150,
        requirements: { helpful_contributions: 10 },
        rarity: 'uncommon'
      },
      {
        id: 'challenge_champion',
        title: 'Challenge Champion',
        description: 'Complete 5 community challenges',
        icon: '🏅',
        category: 'social',
        difficulty: 'hard',
        points: 500,
        requirements: { completed_challenges: 5 },
        rarity: 'rare'
      },

      // Special & Seasonal Achievements
      {
        id: 'new_year_resolution',
        title: 'New Year, New Cycle',
        description: 'Start tracking in January and maintain it all month',
        icon: '🎊',
        category: 'seasonal',
        difficulty: 'medium',
        points: 200,
        requirements: { 
          start_month: 1,
          january_streak: 31
        },
        rarity: 'uncommon',
        seasonal: true
      },
      {
        id: 'summer_consistency',
        title: 'Summer Consistency',
        description: 'Maintain tracking throughout summer vacation season',
        icon: '☀️',
        category: 'seasonal',
        difficulty: 'medium',
        points: 250,
        requirements: {
          summer_consistency: true,
          months: [6, 7, 8]
        },
        rarity: 'uncommon',
        seasonal: true
      }
    ];
  }

  checkAchievements(userId, activity, progressData) {
    const newAchievements = [];
    const userAchievements = this.userAchievements.get(userId) || [];
    const earnedIds = userAchievements.map(a => a.id);
    
    this.achievements.forEach(achievement => {
      if (!earnedIds.includes(achievement.id) && this.meetsRequirements(userId, achievement, activity, progressData)) {
        const earned = {
          ...achievement,
          earnedAt: Date.now(),
          context: this.getAchievementContext(achievement, activity, progressData)
        };
        
        newAchievements.push(earned);
        userAchievements.push(earned);
      }
    });
    
    this.userAchievements.set(userId, userAchievements);
    return newAchievements;
  }

  meetsRequirements(userId, achievement, activity, progressData) {
    const requirements = achievement.requirements;
    
    // Check each requirement type
    if (requirements.entries && progressData.totalEntries < requirements.entries) {
      return false;
    }
    
    if (requirements.daily_streak && progressData.currentStreaks?.daily < requirements.daily_streak) {
      return false;
    }
    
    if (requirements.entries_with_notes && progressData.entriesWithNotes < requirements.entries_with_notes) {
      return false;
    }
    
    if (requirements.complete_cycle && !this.hasCompleteCycle(userId, requirements.data_types)) {
      return false;
    }
    
    if (requirements.education_modules && progressData.completedEducationModules < requirements.education_modules) {
      return false;
    }
    
    if (requirements.perfect_quiz && !progressData.hasPerfectQuiz) {
      return false;
    }
    
    // Seasonal requirements
    if (requirements.seasonal && !this.meetsSeasonalRequirements(requirements, activity)) {
      return false;
    }
    
    return true;
  }

  initializeCategories() {
    return {
      'milestones': { color: '#6366f1', icon: '🌟', description: 'First-time achievements' },
      'consistency': { color: '#f59e0b', icon: '🔥', description: 'Regular tracking rewards' },
      'quality': { color: '#10b981', icon: '📊', description: 'Detailed data tracking' },
      'education': { color: '#8b5cf6', icon: '🎓', description: 'Learning and knowledge' },
      'health': { color: '#06b6d4', icon: '💪', description: 'Wellness tracking' },
      'analysis': { color: '#ef4444', icon: '📈', description: 'Data insights and predictions' },
      'social': { color: '#f97316', icon: '🤝', description: 'Community participation' },
      'seasonal': { color: '#84cc16', icon: '🍃', description: 'Time-limited achievements' }
    };
  }
}

class StreakManager {
  constructor() {
    this.userStreaks = new Map();
    this.streakTypes = this.initializeStreakTypes();
  }

  initializeStreakTypes() {
    return {
      'daily_tracking': {
        name: 'Daily Tracking Streak',
        description: 'Consecutive days of logging cycle data',
        icon: '🔥',
        color: '#f59e0b',
        resetCondition: 'no_entry_for_day',
        milestones: [3, 7, 14, 30, 60, 100, 365],
        rewards: {
          7: { points: 50, badge: 'week_warrior' },
          30: { points: 200, badge: 'month_master', unlock: 'advanced_analytics' },
          100: { points: 1000, badge: 'century_tracker', unlock: 'premium_features' }
        }
      },
      'symptom_tracking': {
        name: 'Symptom Tracking Streak',
        description: 'Consecutive days of detailed symptom logging',
        icon: '📝',
        color: '#10b981',
        resetCondition: 'no_symptom_entry',
        milestones: [5, 14, 30, 60],
        rewards: {
          14: { points: 75, insight: 'symptom_pattern_analysis' },
          30: { points: 150, unlock: 'advanced_symptom_insights' }
        }
      },
      'education_streak': {
        name: 'Learning Streak',
        description: 'Consecutive days of completing educational content',
        icon: '🎓',
        color: '#8b5cf6',
        resetCondition: 'no_education_activity',
        milestones: [3, 7, 14, 21],
        rewards: {
          7: { points: 100, unlock: 'advanced_courses' },
          21: { points: 300, badge: 'dedicated_learner' }
        }
      },
      'wellness_tracking': {
        name: 'Wellness Streak',
        description: 'Consecutive days of tracking sleep, exercise, and nutrition',
        icon: '💪',
        color: '#06b6d4',
        resetCondition: 'missing_wellness_data',
        milestones: [7, 14, 30],
        rewards: {
          14: { points: 200, insight: 'wellness_correlation_analysis' },
          30: { points: 400, badge: 'wellness_warrior' }
        }
      }
    };
  }

  updateStreaks(userId, activity) {
    if (!this.userStreaks.has(userId)) {
      this.userStreaks.set(userId, new Map());
    }
    
    const userStreaks = this.userStreaks.get(userId);
    const updates = [];
    
    // Update each applicable streak type
    Object.entries(this.streakTypes).forEach(([streakType, config]) => {
      if (this.activityAppliesTo(activity, streakType)) {
        const currentStreak = userStreaks.get(streakType) || this.createNewStreak(streakType);
        const updated = this.updateStreak(currentStreak, activity, config);
        
        userStreaks.set(streakType, updated);
        updates.push({
          type: streakType,
          previous: currentStreak.current,
          new: updated.current,
          milestone: this.checkMilestone(updated, config),
          reward: this.getStreakReward(updated, config)
        });
      }
    });
    
    return updates;
  }

  updateStreak(streak, activity, config) {
    const today = new Date().toDateString();
    const activityDate = new Date(activity.timestamp).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (activityDate === today) {
      // Activity is today
      if (streak.lastActivityDate === yesterday) {
        // Continuing streak
        streak.current++;
      } else if (streak.lastActivityDate !== today) {
        // Starting new streak or first activity today
        streak.current = 1;
      }
      // If last activity was also today, don't change streak count
      
      streak.lastActivityDate = today;
      streak.longest = Math.max(streak.longest, streak.current);
    }
    
    return streak;
  }

  createNewStreak(streakType) {
    return {
      type: streakType,
      current: 0,
      longest: 0,
      startDate: Date.now(),
      lastActivityDate: null,
      milestones: [],
      totalRewards: 0
    };
  }

  activityAppliesTo(activity, streakType) {
    const applicableActivities = {
      'daily_tracking': ['symptom_log', 'mood_log', 'flow_log', 'temperature_log', 'general_log'],
      'symptom_tracking': ['symptom_log'],
      'education_streak': ['education_complete', 'quiz_complete', 'module_complete'],
      'wellness_tracking': ['sleep_log', 'exercise_log', 'nutrition_log', 'wellness_log']
    };
    
    return applicableActivities[streakType]?.includes(activity.type) || false;
  }

  getStreakReward(streak, config) {
    const rewards = config.rewards[streak.current];
    if (rewards && !streak.milestones.includes(streak.current)) {
      streak.milestones.push(streak.current);
      return rewards;
    }
    return null;
  }
}

class ChallengeManager {
  constructor() {
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.challengeTemplates = this.initializeChallengeTemplates();
  }

  initializeChallengeTemplates() {
    return {
      'weekly_consistency': {
        title: 'Weekly Warrior Challenge',
        description: 'Track your cycle data every day for one week',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        difficulty: 'medium',
        requirements: {
          daily_entries: 7,
          consecutive: true
        },
        rewards: {
          points: 100,
          badge: 'weekly_warrior',
          unlock: 'trend_analysis'
        },
        category: 'consistency'
      },
      'symptom_detective': {
        title: 'Symptom Detective',
        description: 'Log detailed symptoms for 14 days to discover patterns',
        duration: 14 * 24 * 60 * 60 * 1000,
        difficulty: 'medium',
        requirements: {
          symptom_entries: 14,
          detail_level: 'high'
        },
        rewards: {
          points: 200,
          badge: 'symptom_detective',
          insight: 'personal_symptom_patterns'
        },
        category: 'health'
      },
      'education_explorer': {
        title: 'Knowledge Explorer',
        description: 'Complete 3 educational modules in one week',
        duration: 7 * 24 * 60 * 60 * 1000,
        difficulty: 'easy',
        requirements: {
          education_modules: 3,
          quizzes_passed: 3
        },
        rewards: {
          points: 150,
          badge: 'knowledge_explorer',
          unlock: 'advanced_education'
        },
        category: 'education'
      },
      'wellness_champion': {
        title: 'Wellness Champion',
        description: 'Track sleep, exercise, and nutrition alongside your cycle for 21 days',
        duration: 21 * 24 * 60 * 60 * 1000,
        difficulty: 'hard',
        requirements: {
          wellness_days: 21,
          categories: ['sleep', 'exercise', 'nutrition', 'cycle']
        },
        rewards: {
          points: 500,
          badge: 'wellness_champion',
          unlock: 'holistic_insights',
          premium_feature: 'advanced_correlations'
        },
        category: 'health'
      },
      'prediction_master': {
        title: 'Prediction Master',
        description: 'Achieve 95% accuracy in cycle predictions over 3 months',
        duration: 90 * 24 * 60 * 60 * 1000,
        difficulty: 'legendary',
        requirements: {
          prediction_accuracy: 0.95,
          cycles: 3,
          data_quality: 'high'
        },
        rewards: {
          points: 1000,
          badge: 'prediction_master',
          title: 'Cycle Prediction Expert',
          unlock: 'ai_insights_beta'
        },
        category: 'analysis'
      }
    };
  }

  getAvailableChallenges(userProfile) {
    const available = [];
    const userLevel = userProfile.level || 1;
    const completedChallenges = this.getCompletedChallenges(userProfile.userId);
    const completedIds = completedChallenges.map(c => c.templateId);
    
    Object.entries(this.challengeTemplates).forEach(([id, template]) => {
      if (!completedIds.includes(id) && this.meetsPrerequisites(userProfile, template)) {
        available.push({
          id,
          ...template,
          estimatedDifficulty: this.calculatePersonalDifficulty(userProfile, template),
          recommendationScore: this.calculateRecommendationScore(userProfile, template)
        });
      }
    });
    
    return available.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  createPersonalChallenge(userId, title, description, requirements, duration) {
    const challenge = {
      id: this.generateChallengeId(),
      userId,
      type: 'personal',
      title,
      description,
      requirements,
      duration,
      startDate: Date.now(),
      endDate: Date.now() + duration,
      progress: { current: 0, milestones: [] },
      rewards: this.calculatePersonalChallengeRewards(requirements, duration),
      status: 'active'
    };
    
    this.addChallenge(userId, challenge);
    return challenge;
  }

  updateChallenges(userId, activity) {
    const userChallenges = this.userChallenges.get(userId) || [];
    const updates = [];
    
    userChallenges.forEach(challenge => {
      if (challenge.status === 'active' && this.activityContributes(activity, challenge)) {
        const previousProgress = challenge.progress.current;
        this.updateChallengeProgress(challenge, activity);
        
        const update = {
          challengeId: challenge.id,
          previousProgress,
          newProgress: challenge.progress.current,
          completed: challenge.status === 'completed',
          rewards: challenge.status === 'completed' ? challenge.rewards : null
        };
        
        updates.push(update);
      }
    });
    
    return updates;
  }

  generateChallengeId() {
    return 'challenge_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }
}

class RewardSystem {
  constructor() {
    this.rewardTypes = this.initializeRewardTypes();
    this.userRewards = new Map();
    this.rewardCalculator = new RewardCalculator();
  }

  initializeRewardTypes() {
    return {
      'points': {
        name: 'Experience Points',
        description: 'Points that contribute to leveling up',
        icon: '⭐',
        immediate: true
      },
      'badges': {
        name: 'Achievement Badges',
        description: 'Visual recognition of accomplishments',
        icon: '🏆',
        persistent: true
      },
      'insights': {
        name: 'Personal Insights',
        description: 'Unlock deeper analysis of your data',
        icon: '💡',
        functional: true
      },
      'themes': {
        name: 'Custom Themes',
        description: 'Personalize your app appearance',
        icon: '🎨',
        cosmetic: true
      },
      'features': {
        name: 'Premium Features',
        description: 'Access advanced functionality',
        icon: '🚀',
        functional: true,
        valuable: true
      },
      'titles': {
        name: 'Achievement Titles',
        description: 'Show off your expertise',
        icon: '👑',
        social: true
      }
    };
  }

  calculateRewards(userId, activityData) {
    const rewards = [];
    
    // Base activity rewards
    const baseReward = this.calculateBaseReward(activityData.activity);
    if (baseReward.points > 0) {
      rewards.push({
        type: 'points',
        amount: baseReward.points,
        reason: baseReward.reason,
        timestamp: Date.now()
      });
    }
    
    // Quality bonus
    if (activityData.activity.quality > 0.8) {
      rewards.push({
        type: 'points',
        amount: Math.round(baseReward.points * 0.2),
        reason: 'High quality data bonus',
        timestamp: Date.now()
      });
    }
    
    // Streak rewards
    if (activityData.streakUpdate) {
      activityData.streakUpdate.forEach(streak => {
        if (streak.reward) {
          rewards.push({
            type: 'streak_reward',
            streak: streak.type,
            milestone: streak.new,
            rewards: streak.reward,
            timestamp: Date.now()
          });
        }
      });
    }
    
    // Achievement rewards
    if (activityData.newAchievements && activityData.newAchievements.length > 0) {
      activityData.newAchievements.forEach(achievement => {
        rewards.push({
          type: 'achievement_reward',
          achievementId: achievement.id,
          points: achievement.points,
          additionalRewards: achievement.rewards || [],
          timestamp: Date.now()
        });
      });
    }
    
    // Level up rewards
    if (activityData.levelUpdate && activityData.levelUpdate.leveledUp) {
      rewards.push({
        type: 'level_up_reward',
        newLevel: activityData.levelUpdate.newLevel,
        rewards: this.getLevelUpRewards(activityData.levelUpdate.newLevel),
        timestamp: Date.now()
      });
    }
    
    this.addRewardsToUser(userId, rewards);
    return rewards;
  }

  calculateBaseReward(activity) {
    const basePoints = {
      'symptom_log': 5,
      'mood_log': 5,
      'flow_log': 3,
      'temperature_log': 8,
      'exercise_log': 4,
      'sleep_log': 4,
      'nutrition_log': 4,
      'education_complete': 15,
      'quiz_complete': 10
    };
    
    const points = basePoints[activity.type] || 2;
    const qualityMultiplier = Math.max(0.5, activity.quality);
    
    return {
      points: Math.round(points * qualityMultiplier),
      reason: `Logged ${activity.type.replace('_', ' ')}`
    };
  }

  getLevelUpRewards(level) {
    const rewards = [];
    
    // Standard level up rewards
    rewards.push({
      type: 'points',
      amount: level * 50,
      reason: 'Level up bonus'
    });
    
    // Special milestone rewards
    if (level % 5 === 0) {
      rewards.push({
        type: 'theme',
        item: `level_${level}_theme`,
        reason: 'Milestone level reached'
      });
    }
    
    if (level % 10 === 0) {
      rewards.push({
        type: 'feature',
        item: 'advanced_analytics',
        reason: 'Major milestone achievement'
      });
    }
    
    // Legendary levels
    if (level >= 50) {
      rewards.push({
        type: 'title',
        item: 'Cycle Tracking Legend',
        reason: 'Legendary dedication to health tracking'
      });
    }
    
    return rewards;
  }

  addRewardsToUser(userId, rewards) {
    if (!this.userRewards.has(userId)) {
      this.userRewards.set(userId, []);
    }
    
    const userRewards = this.userRewards.get(userId);
    userRewards.push(...rewards);
    
    // Keep only recent rewards in memory (last 100)
    if (userRewards.length > 100) {
      userRewards.splice(0, userRewards.length - 100);
    }
  }
}

class LevelingSystem {
  constructor() {
    this.userLevels = new Map();
    this.experienceRequirements = this.calculateExperienceRequirements();
  }

  calculateExperienceRequirements() {
    const requirements = [];
    let baseExp = 100;
    
    for (let level = 1; level <= 100; level++) {
      requirements.push({
        level,
        experience: level === 1 ? 0 : Math.round(baseExp * Math.pow(1.15, level - 1)),
        title: this.getLevelTitle(level),
        perks: this.getLevelPerks(level)
      });
    }
    
    return requirements;
  }

  getLevelTitle(level) {
    if (level < 5) return 'Beginner Tracker';
    if (level < 10) return 'Regular Tracker';
    if (level < 20) return 'Dedicated Tracker';
    if (level < 30) return 'Expert Tracker';
    if (level < 40) return 'Master Tracker';
    if (level < 50) return 'Legendary Tracker';
    return 'Grandmaster Tracker';
  }

  updateLevel(userId, progressData) {
    const currentLevel = this.getCurrentLevel(userId);
    const newExperience = currentLevel.experience + (progressData.pointsEarned || 0);
    
    const newLevelData = this.calculateLevelFromExperience(newExperience);
    const leveledUp = newLevelData.level > currentLevel.level;
    
    this.userLevels.set(userId, {
      level: newLevelData.level,
      experience: newExperience,
      experienceInCurrentLevel: newLevelData.experienceInLevel,
      experienceToNextLevel: newLevelData.experienceToNext,
      progressToNext: newLevelData.progressToNext,
      title: newLevelData.title,
      lastUpdated: Date.now()
    });
    
    return {
      leveledUp,
      previousLevel: currentLevel.level,
      newLevel: newLevelData.level,
      experience: newExperience,
      progressToNext: newLevelData.progressToNext
    };
  }

  getCurrentLevel(userId) {
    return this.userLevels.get(userId) || {
      level: 1,
      experience: 0,
      experienceInCurrentLevel: 0,
      experienceToNextLevel: this.experienceRequirements[1].experience,
      progressToNext: 0,
      title: 'Beginner Tracker',
      lastUpdated: Date.now()
    };
  }

  calculateLevelFromExperience(totalExperience) {
    let level = 1;
    let experienceInLevel = totalExperience;
    
    for (let i = 1; i < this.experienceRequirements.length; i++) {
      if (totalExperience >= this.experienceRequirements[i].experience) {
        level = this.experienceRequirements[i].level;
        experienceInLevel = totalExperience - this.experienceRequirements[i].experience;
      } else {
        break;
      }
    }
    
    const nextLevelReq = this.experienceRequirements[level] || this.experienceRequirements[this.experienceRequirements.length - 1];
    const experienceToNext = nextLevelReq.experience - totalExperience;
    const progressToNext = level < 100 ? experienceInLevel / (nextLevelReq.experience - (level > 1 ? this.experienceRequirements[level - 1].experience : 0)) : 1;
    
    return {
      level,
      experienceInLevel,
      experienceToNext: Math.max(0, experienceToNext),
      progressToNext: Math.min(1, progressToNext),
      title: this.getLevelTitle(level)
    };
  }
}

class SocialFeatures {
  constructor() {
    this.communityChallenges = new Map();
    this.leaderboards = new Map();
    this.userStats = new Map();
  }

  createCommunityChallenge(challengeData) {
    const challenge = {
      id: this.generateId(),
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type, // 'individual', 'team', 'global'
      startDate: challengeData.startDate || Date.now(),
      endDate: challengeData.endDate,
      requirements: challengeData.requirements,
      participants: [],
      leaderboard: [],
      status: 'active'
    };
    
    this.communityChallenges.set(challenge.id, challenge);
    return challenge;
  }

  generateLeaderboard(challengeId, metric = 'points') {
    const challenge = this.communityChallenges.get(challengeId);
    if (!challenge) return null;
    
    const leaderboard = challenge.participants
      .map(participant => ({
        userId: participant.userId,
        score: participant.progress[metric] || 0,
        rank: 0 // Will be calculated
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    this.leaderboards.set(challengeId, leaderboard);
    return leaderboard;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}