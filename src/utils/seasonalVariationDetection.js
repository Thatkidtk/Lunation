export class SeasonalVariationDetectionSystem {
  constructor() {
    this.seasonalAnalyzer = new SeasonalAnalyzer();
    this.circadianAnalyzer = new CircadianAnalyzer();
    this.environmentalFactors = new EnvironmentalFactors();
    this.climaticInfluences = new ClimaticInfluences();
    this.lightExposureTracker = new LightExposureTracker();
    this.adaptationEngine = new SeasonalAdaptationEngine();
    this.predictionAdjuster = new SeasonalPredictionAdjuster();
  }

  analyzeSeasonalVariations(userData, timeRange = 365) {
    const seasonalData = this.prepareSeasonalData(userData, timeRange);
    const patterns = this.seasonalAnalyzer.detectPatterns(seasonalData);
    const influences = this.identifySeasonalInfluences(seasonalData);
    const adaptations = this.generateSeasonalAdaptations(patterns, influences);
    
    return {
      patterns,
      influences,
      adaptations,
      currentSeasonEffects: this.getCurrentSeasonEffects(userData),
      predictions: this.generateSeasonalPredictions(patterns),
      recommendations: this.generateSeasonalRecommendations(patterns, influences),
      insights: this.generateSeasonalInsights(patterns, influences)
    };
  }

  prepareSeasonalData(userData, timeRange) {
    const cutoffDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
    const seasonalData = {
      cycles: [],
      symptoms: [],
      mood: [],
      energy: [],
      sleep: [],
      temperature: [],
      environmental: [],
      location: userData.location || { latitude: 40.7128, longitude: -74.0060 } // Default to NYC
    };

    // Group data by seasons
    userData.cycleHistory?.forEach(cycle => {
      if (cycle.startDate >= cutoffDate) {
        const season = this.getSeason(cycle.startDate, seasonalData.location);
        const month = new Date(cycle.startDate).getMonth();
        
        seasonalData.cycles.push({
          ...cycle,
          season,
          month,
          dayLength: this.calculateDayLength(cycle.startDate, seasonalData.location),
          solarIntensity: this.calculateSolarIntensity(cycle.startDate, seasonalData.location)
        });
      }
    });

    // Group symptoms by season
    userData.symptomHistory?.forEach(entry => {
      if (entry.timestamp >= cutoffDate) {
        const season = this.getSeason(entry.timestamp, seasonalData.location);
        const month = new Date(entry.timestamp).getMonth();
        
        seasonalData.symptoms.push({
          ...entry,
          season,
          month
        });
      }
    });

    // Group mood and energy data
    userData.moodHistory?.forEach(entry => {
      if (entry.timestamp >= cutoffDate) {
        const season = this.getSeason(entry.timestamp, seasonalData.location);
        seasonalData.mood.push({ ...entry, season });
      }
    });

    userData.energyHistory?.forEach(entry => {
      if (entry.timestamp >= cutoffDate) {
        const season = this.getSeason(entry.timestamp, seasonalData.location);
        seasonalData.energy.push({ ...entry, season });
      }
    });

    return seasonalData;
  }

  getSeason(timestamp, location) {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Adjust for Southern Hemisphere
    const isNorthern = location.latitude >= 0;
    
    if (isNorthern) {
      if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
        return 'winter';
      } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
        return 'spring';
      } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
        return 'summer';
      } else {
        return 'autumn';
      }
    } else {
      // Flip seasons for Southern Hemisphere
      if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
        return 'summer';
      } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
        return 'autumn';
      } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
        return 'winter';
      } else {
        return 'spring';
      }
    }
  }

  calculateDayLength(timestamp, location) {
    const date = new Date(timestamp);
    const dayOfYear = this.getDayOfYear(date);
    const latitude = location.latitude * Math.PI / 180; // Convert to radians
    
    // Solar declination angle
    const declination = 23.45 * Math.sin((360 * (dayOfYear - 81) / 365) * Math.PI / 180) * Math.PI / 180;
    
    // Hour angle
    const hourAngle = Math.acos(-Math.tan(latitude) * Math.tan(declination));
    
    // Day length in hours
    const dayLength = (2 * hourAngle * 180 / Math.PI) / 15;
    
    return Math.max(0, Math.min(24, dayLength));
  }

  calculateSolarIntensity(timestamp, location) {
    const date = new Date(timestamp);
    const dayOfYear = this.getDayOfYear(date);
    const latitude = Math.abs(location.latitude);
    
    // Solar declination
    const declination = 23.45 * Math.sin((360 * (dayOfYear - 81) / 365) * Math.PI / 180);
    
    // Solar elevation at solar noon
    const solarElevation = 90 - latitude + declination;
    
    // Normalize to 0-1 scale
    return Math.max(0, Math.min(1, solarElevation / 90));
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - start) / (24 * 60 * 60 * 1000)) + 1;
  }

  identifySeasonalInfluences(seasonalData) {
    const influences = {
      cycleLength: this.analyzeCycleLengthVariations(seasonalData.cycles),
      symptomSeverity: this.analyzeSymptomSeasonality(seasonalData.symptoms),
      moodPatterns: this.analyzeMoodSeasonality(seasonalData.mood),
      energyLevels: this.analyzeEnergySeasonality(seasonalData.energy),
      lightExposure: this.analyzeLightInfluence(seasonalData),
      temperature: this.analyzeTemperatureInfluence(seasonalData),
      hormonalShifts: this.analyzeHormonalSeasonality(seasonalData)
    };

    return influences;
  }

  analyzeCycleLengthVariations(cycles) {
    if (cycles.length < 12) {
      return { insufficient_data: true, message: 'Need at least 12 cycles for seasonal analysis' };
    }

    const seasonalAverages = {};
    const seasons = ['winter', 'spring', 'summer', 'autumn'];
    
    seasons.forEach(season => {
      const seasonCycles = cycles.filter(cycle => cycle.season === season);
      if (seasonCycles.length > 0) {
        const avgLength = seasonCycles.reduce((sum, cycle) => sum + cycle.length, 0) / seasonCycles.length;
        const variance = seasonCycles.reduce((sum, cycle) => sum + Math.pow(cycle.length - avgLength, 2), 0) / seasonCycles.length;
        
        seasonalAverages[season] = {
          averageLength: avgLength,
          variance: variance,
          standardDeviation: Math.sqrt(variance),
          cycleCount: seasonCycles.length,
          dayLengthCorrelation: this.calculateDayLengthCorrelation(seasonCycles)
        };
      }
    });

    const overallAverage = cycles.reduce((sum, cycle) => sum + cycle.length, 0) / cycles.length;
    const seasonalVariation = this.calculateSeasonalVariation(seasonalAverages, overallAverage);

    return {
      seasonalAverages,
      overallAverage,
      seasonalVariation,
      significance: this.assessStatisticalSignificance(seasonalAverages),
      insights: this.generateCycleLengthInsights(seasonalAverages, seasonalVariation)
    };
  }

  analyzeSymptomSeasonality(symptoms) {
    if (symptoms.length < 50) {
      return { insufficient_data: true };
    }

    const seasonalSymptoms = {};
    const symptomTypes = ['cramps', 'headache', 'bloating', 'mood_swings', 'fatigue', 'breast_tenderness'];

    symptomTypes.forEach(symptomType => {
      const relevantSymptoms = symptoms.filter(s => s.symptoms && s.symptoms.includes(symptomType));
      
      if (relevantSymptoms.length > 10) {
        const seasonalData = {};
        
        ['winter', 'spring', 'summer', 'autumn'].forEach(season => {
          const seasonSymptoms = relevantSymptoms.filter(s => s.season === season);
          if (seasonSymptoms.length > 0) {
            const avgSeverity = seasonSymptoms.reduce((sum, s) => {
              const severity = s.severity && s.severity[symptomType] ? s.severity[symptomType] : 5;
              return sum + severity;
            }, 0) / seasonSymptoms.length;

            const frequency = seasonSymptoms.length / relevantSymptoms.length;

            seasonalData[season] = {
              averageSeverity: avgSeverity,
              frequency: frequency,
              count: seasonSymptoms.length
            };
          }
        });

        seasonalSymptoms[symptomType] = {
          seasonalData,
          peakSeason: this.identifyPeakSeason(seasonalData, 'averageSeverity'),
          seasonalVariation: this.calculateSymptomVariation(seasonalData)
        };
      }
    });

    return {
      symptomSeasonality: seasonalSymptoms,
      overallPatterns: this.identifyOverallSymptomPatterns(seasonalSymptoms),
      recommendations: this.generateSymptomSeasonalRecommendations(seasonalSymptoms)
    };
  }

  analyzeMoodSeasonality(moodData) {
    if (moodData.length < 30) {
      return { insufficient_data: true };
    }

    const seasonalMood = {};
    const moodMetrics = ['overallMood', 'anxiety', 'depression', 'irritability', 'energy', 'motivation'];

    moodMetrics.forEach(metric => {
      const seasonalData = {};
      
      ['winter', 'spring', 'summer', 'autumn'].forEach(season => {
        const seasonMoods = moodData.filter(m => m.season === season);
        
        if (seasonMoods.length > 5) {
          const values = seasonMoods
            .map(m => m[metric] || m.emotions?.[metric] || 5)
            .filter(v => v !== undefined);
          
          if (values.length > 0) {
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
            
            seasonalData[season] = {
              average: average,
              variance: variance,
              count: values.length,
              trend: this.calculateSeasonalTrend(seasonMoods, metric)
            };
          }
        }
      });

      if (Object.keys(seasonalData).length >= 3) {
        seasonalMood[metric] = {
          seasonalData,
          seasonalAffectiveDisorder: this.assessSADRisk(seasonalData, metric),
          optimalSeasons: this.identifyOptimalSeasons(seasonalData),
          challengingSeasons: this.identifyChallengingSeasons(seasonalData)
        };
      }
    });

    return {
      seasonalMoodPatterns: seasonalMood,
      sadRiskAssessment: this.comprehensiveSADAssessment(seasonalMood),
      lightTherapyRecommendations: this.generateLightTherapyRecommendations(seasonalMood),
      seasonalCopingStrategies: this.generateSeasonalCopingStrategies(seasonalMood)
    };
  }

  analyzeEnergySeasonality(energyData) {
    if (energyData.length < 30) {
      return { insufficient_data: true };
    }

    const seasonalEnergy = {};
    const energyTypes = ['physicalEnergy', 'mentalEnergy', 'emotionalEnergy', 'fatigue'];

    energyTypes.forEach(energyType => {
      const seasonalData = {};
      
      ['winter', 'spring', 'summer', 'autumn'].forEach(season => {
        const seasonEnergy = energyData.filter(e => e.season === season);
        
        if (seasonEnergy.length > 5) {
          const values = seasonEnergy
            .map(e => e[energyType])
            .filter(v => v !== undefined);
          
          if (values.length > 0) {
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            const peak = Math.max(...values);
            const low = Math.min(...values);
            
            seasonalData[season] = {
              average,
              peak,
              low,
              variability: peak - low,
              count: values.length,
              circadianAlignment: this.assessCircadianAlignment(seasonEnergy, season)
            };
          }
        }
      });

      if (Object.keys(seasonalData).length >= 3) {
        seasonalEnergy[energyType] = {
          seasonalData,
          energeticSeasons: this.identifyEnergeticSeasons(seasonalData),
          lowEnergySeasons: this.identifyLowEnergySeasons(seasonalData),
          recommendations: this.generateEnergyRecommendations(seasonalData, energyType)
        };
      }
    });

    return {
      seasonalEnergyPatterns: seasonalEnergy,
      overallEnergyProfile: this.createSeasonalEnergyProfile(seasonalEnergy),
      adaptationStrategies: this.generateEnergyAdaptationStrategies(seasonalEnergy)
    };
  }

  analyzeLightInfluence(seasonalData) {
    const lightInfluence = {
      daylightCorrelations: this.calculateDaylightCorrelations(seasonalData),
      solarIntensityEffects: this.analyzeSolarIntensityEffects(seasonalData),
      artificialLightNeeds: this.assessArtificialLightNeeds(seasonalData),
      circadianDisruption: this.assessCircadianDisruption(seasonalData)
    };

    return lightInfluence;
  }

  calculateDaylightCorrelations(seasonalData) {
    const correlations = {};
    
    if (seasonalData.cycles.length > 10) {
      const cycleDayLengths = seasonalData.cycles.map(cycle => ({
        dayLength: cycle.dayLength,
        cycleLength: cycle.length,
        season: cycle.season
      }));

      const correlation = this.calculateCorrelation(
        cycleDayLengths.map(c => c.dayLength),
        cycleDayLengths.map(c => c.cycleLength)
      );

      correlations.cycleLengthVsDaylight = {
        correlation: correlation,
        strength: this.interpretCorrelationStrength(correlation),
        significance: Math.abs(correlation) > 0.3 ? 'significant' : 'not_significant'
      };
    }

    if (seasonalData.mood.length > 20) {
      // Calculate mood vs daylight correlation by estimating daylight for each mood entry
      const moodDaylight = seasonalData.mood.map(mood => ({
        dayLength: this.calculateDayLength(mood.timestamp, seasonalData.location),
        mood: mood.overallMood || 5
      }));

      const moodLightCorrelation = this.calculateCorrelation(
        moodDaylight.map(m => m.dayLength),
        moodDaylight.map(m => m.mood)
      );

      correlations.moodVsDaylight = {
        correlation: moodLightCorrelation,
        strength: this.interpretCorrelationStrength(moodLightCorrelation),
        lightTherapyRecommended: moodLightCorrelation < -0.3
      };
    }

    return correlations;
  }

  generateSeasonalAdaptations(patterns, influences) {
    const adaptations = {
      cyclePredictionAdjustments: this.generateCyclePredictionAdjustments(patterns),
      symptomPreparation: this.generateSymptomPreparation(influences),
      moodSupport: this.generateMoodSupport(influences),
      energyOptimization: this.generateEnergyOptimization(influences),
      lightTherapy: this.generateLightTherapyPlan(influences),
      nutritionalAdaptations: this.generateNutritionalAdaptations(influences),
      exerciseAdaptations: this.generateExerciseAdaptations(influences),
      supplementationRecommendations: this.generateSupplementationRecommendations(influences)
    };

    return adaptations;
  }

  generateCyclePredictionAdjustments(patterns) {
    if (!patterns.cycleLength || patterns.cycleLength.insufficient_data) {
      return { message: 'Insufficient data for seasonal cycle adjustments' };
    }

    const adjustments = {};
    const seasonalAverages = patterns.cycleLength.seasonalAverages;

    Object.entries(seasonalAverages).forEach(([season, data]) => {
      const deviationFromOverall = data.averageLength - patterns.cycleLength.overallAverage;
      
      if (Math.abs(deviationFromOverall) > 1) { // Significant deviation (more than 1 day)
        adjustments[season] = {
          adjustment: deviationFromOverall,
          confidence: this.calculateAdjustmentConfidence(data),
          recommendation: deviationFromOverall > 0 ? 
            `Cycles tend to be ${Math.round(deviationFromOverall)} days longer in ${season}` :
            `Cycles tend to be ${Math.round(Math.abs(deviationFromOverall))} days shorter in ${season}`
        };
      }
    });

    return {
      adjustments,
      implementationStrategy: this.createImplementationStrategy(adjustments),
      validationPlan: this.createValidationPlan(adjustments)
    };
  }

  generateSeasonalRecommendations(patterns, influences) {
    const recommendations = [];

    // Cycle-related recommendations
    if (patterns.cycleLength && !patterns.cycleLength.insufficient_data) {
      const winterCycles = patterns.cycleLength.seasonalAverages.winter;
      const summerCycles = patterns.cycleLength.seasonalAverages.summer;
      
      if (winterCycles && summerCycles && Math.abs(winterCycles.averageLength - summerCycles.averageLength) > 2) {
        recommendations.push({
          type: 'cycle_adjustment',
          priority: 'medium',
          message: 'Your cycle length varies significantly between winter and summer. Adjust predictions accordingly.',
          details: `Winter cycles: ${winterCycles.averageLength.toFixed(1)} days, Summer cycles: ${summerCycles.averageLength.toFixed(1)} days`,
          season: 'all'
        });
      }
    }

    // Mood-related recommendations
    if (influences.moodPatterns && influences.moodPatterns.sadRiskAssessment) {
      const sadRisk = influences.moodPatterns.sadRiskAssessment;
      if (sadRisk.riskLevel === 'high' || sadRisk.riskLevel === 'moderate') {
        recommendations.push({
          type: 'light_therapy',
          priority: 'high',
          message: 'Consider light therapy to manage seasonal mood changes.',
          details: 'Use a 10,000 lux light therapy lamp for 30 minutes each morning during darker months.',
          season: 'winter',
          timing: 'morning'
        });
      }
    }

    // Energy-related recommendations
    if (influences.energyLevels && influences.energyLevels.seasonalEnergyPatterns) {
      const energyPatterns = influences.energyLevels.seasonalEnergyPatterns;
      
      Object.entries(energyPatterns).forEach(([energyType, data]) => {
        if (data.lowEnergySeasons && data.lowEnergySeasons.length > 0) {
          const seasons = data.lowEnergySeasons.join(' and ');
          recommendations.push({
            type: 'energy_management',
            priority: 'medium',
            message: `Your ${energyType} tends to be lower during ${seasons}.`,
            details: 'Plan lighter schedules and prioritize rest during these seasons.',
            season: data.lowEnergySeasons,
            energyType: energyType
          });
        }
      });
    }

    // Symptom-related recommendations
    if (influences.symptomSeverity && influences.symptomSeverity.symptomSeasonality) {
      Object.entries(influences.symptomSeverity.symptomSeasonality).forEach(([symptom, data]) => {
        if (data.peakSeason) {
          recommendations.push({
            type: 'symptom_preparation',
            priority: 'medium',
            message: `Your ${symptom} symptoms tend to be worse during ${data.peakSeason}.`,
            details: 'Consider proactive management strategies before this season begins.',
            season: data.peakSeason,
            symptom: symptom
          });
        }
      });
    }

    return this.prioritizeRecommendations(recommendations);
  }

  generateSeasonalInsights(patterns, influences) {
    const insights = [];

    // Generate cycle insights
    if (patterns.cycleLength && !patterns.cycleLength.insufficient_data) {
      const variation = patterns.cycleLength.seasonalVariation;
      if (variation && variation.coefficient > 0.1) {
        insights.push({
          type: 'cycle_variation',
          significance: 'high',
          insight: `Your cycle length varies by up to ${Math.round(variation.range)} days between seasons.`,
          implications: 'This is within normal range but affects prediction accuracy.',
          actionable: 'Use seasonal adjustments for better predictions.'
        });
      }
    }

    // Generate mood insights
    if (influences.moodPatterns && influences.moodPatterns.seasonalMoodPatterns) {
      const moodPatterns = influences.moodPatterns.seasonalMoodPatterns;
      
      if (moodPatterns.overallMood) {
        const optimal = moodPatterns.overallMood.optimalSeasons;
        const challenging = moodPatterns.overallMood.challengingSeasons;
        
        if (optimal && optimal.length > 0) {
          insights.push({
            type: 'mood_optimization',
            significance: 'medium',
            insight: `Your mood tends to be best during ${optimal.join(' and ')}.`,
            implications: 'Plan important activities and decisions during these seasons.',
            actionable: 'Schedule challenging projects for your optimal seasons.'
          });
        }
        
        if (challenging && challenging.length > 0) {
          insights.push({
            type: 'mood_support',
            significance: 'high',
            insight: `You may experience mood challenges during ${challenging.join(' and ')}.`,
            implications: 'Extra self-care and support may be beneficial.',
            actionable: 'Develop coping strategies for challenging seasons.'
          });
        }
      }
    }

    // Generate light exposure insights
    if (influences.lightExposure && influences.lightExposure.daylightCorrelations) {
      const correlations = influences.lightExposure.daylightCorrelations;
      
      if (correlations.moodVsDaylight && correlations.moodVsDaylight.strength === 'strong') {
        insights.push({
          type: 'light_sensitivity',
          significance: 'high',
          insight: 'Your mood is strongly correlated with daylight exposure.',
          implications: 'Light therapy and outdoor time may significantly impact your wellbeing.',
          actionable: 'Prioritize light exposure, especially during darker months.'
        });
      }
    }

    return insights.slice(0, 5); // Return top 5 insights
  }

  getCurrentSeasonEffects(userData) {
    const currentSeason = this.getSeason(Date.now(), userData.location);
    const currentMonth = new Date().getMonth();
    const currentDayLength = this.calculateDayLength(Date.now(), userData.location);
    
    return {
      season: currentSeason,
      month: currentMonth,
      dayLength: currentDayLength,
      expectedEffects: this.getExpectedSeasonalEffects(currentSeason),
      personalizedEffects: this.getPersonalizedSeasonalEffects(userData, currentSeason),
      recommendations: this.getCurrentSeasonRecommendations(currentSeason, userData)
    };
  }

  getExpectedSeasonalEffects(season) {
    const effects = {
      winter: {
        cycle: 'Cycles may be slightly longer',
        mood: 'Potential for seasonal mood changes',
        energy: 'Energy levels may decrease',
        symptoms: 'PMS symptoms may be more pronounced',
        sleep: 'May need more sleep',
        cravings: 'Increased carbohydrate cravings'
      },
      spring: {
        cycle: 'Cycles typically stabilize',
        mood: 'Mood generally improves',
        energy: 'Energy levels start to increase',
        symptoms: 'Symptoms may become more manageable',
        sleep: 'Sleep patterns may shift earlier',
        motivation: 'Increased motivation for new activities'
      },
      summer: {
        cycle: 'Cycles may be shorter and more regular',
        mood: 'Peak mood and emotional wellbeing',
        energy: 'Highest energy levels',
        symptoms: 'Generally fewer troublesome symptoms',
        social: 'Increased social activity',
        vitamin_d: 'Natural vitamin D production peaks'
      },
      autumn: {
        cycle: 'Cycles may start to lengthen',
        mood: 'Mood may begin to decline',
        energy: 'Energy levels may start decreasing',
        symptoms: 'Some symptoms may intensify',
        preparation: 'Body prepares for winter',
        focus: 'Good time for focused work and planning'
      }
    };

    return effects[season] || {};
  }

  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 3) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  interpretCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.5) return 'moderate';
    if (abs >= 0.3) return 'weak';
    return 'negligible';
  }

  exportSeasonalData(userId) {
    return {
      seasonalPatterns: this.seasonalAnalyzer.getPatterns(userId),
      influences: this.environmentalFactors.getInfluences(userId),
      adaptations: this.adaptationEngine.getAdaptations(userId),
      predictions: this.predictionAdjuster.getAdjustments(userId),
      insights: this.generateSeasonalInsights(
        this.seasonalAnalyzer.getPatterns(userId),
        this.environmentalFactors.getInfluences(userId)
      ),
      currentEffects: this.getCurrentSeasonEffects({ userId }),
      recommendations: this.generateSeasonalRecommendations(
        this.seasonalAnalyzer.getPatterns(userId),
        this.environmentalFactors.getInfluences(userId)
      )
    };
  }

  prioritizeRecommendations(recommendations) {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return recommendations
      .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
      .slice(0, 10);
  }
}

class SeasonalAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.statisticalTests = new StatisticalTests();
  }

  detectPatterns(seasonalData) {
    const patterns = {
      cycleLength: this.analyzeCycleSeasonality(seasonalData.cycles),
      symptomPatterns: this.analyzeSymptomSeasonality(seasonalData.symptoms),
      moodPatterns: this.analyzeMoodSeasonality(seasonalData.mood),
      energyPatterns: this.analyzeEnergySeasonality(seasonalData.energy),
      temperaturePatterns: this.analyzeTemperatureSeasonality(seasonalData.temperature)
    };

    return patterns;
  }

  analyzeCycleSeasonality(cycles) {
    if (cycles.length < 8) {
      return { insufficient_data: true };
    }

    const seasonalStats = this.calculateSeasonalStatistics(cycles, 'length');
    const anovaResult = this.statisticalTests.oneWayANOVA(cycles, 'season', 'length');
    const trendAnalysis = this.analyzeTrend(cycles);

    return {
      seasonalStatistics: seasonalStats,
      significance: anovaResult,
      trends: trendAnalysis,
      recommendations: this.generateCycleRecommendations(seasonalStats, anovaResult)
    };
  }

  calculateSeasonalStatistics(data, metric) {
    const seasons = ['winter', 'spring', 'summer', 'autumn'];
    const stats = {};

    seasons.forEach(season => {
      const seasonData = data.filter(item => item.season === season);
      if (seasonData.length > 0) {
        const values = seasonData.map(item => item[metric]);
        stats[season] = {
          count: values.length,
          mean: this.calculateMean(values),
          median: this.calculateMedian(values),
          standardDeviation: this.calculateStandardDeviation(values),
          min: Math.min(...values),
          max: Math.max(...values),
          range: Math.max(...values) - Math.min(...values)
        };
      }
    });

    return stats;
  }

  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  calculateStandardDeviation(values) {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

class EnvironmentalFactors {
  constructor() {
    this.weatherAPI = new WeatherDataAPI();
    this.airQualityAPI = new AirQualityAPI();
    this.geolocationService = new GeolocationService();
  }

  async getEnvironmentalInfluences(userData, timeRange) {
    const location = userData.location || await this.geolocationService.getCurrentLocation();
    const environmentalData = await this.gatherEnvironmentalData(location, timeRange);
    
    return {
      weatherCorrelations: this.analyzeWeatherCorrelations(environmentalData, userData),
      airQualityEffects: this.analyzeAirQualityEffects(environmentalData, userData),
      barometricPressure: this.analyzeBarometricEffects(environmentalData, userData),
      seasonalTransitions: this.analyzeTransitionEffects(environmentalData, userData),
      recommendations: this.generateEnvironmentalRecommendations(environmentalData)
    };
  }

  async gatherEnvironmentalData(location, timeRange) {
    // This would integrate with actual weather APIs in production
    return {
      temperature: this.generateMockTemperatureData(timeRange),
      humidity: this.generateMockHumidityData(timeRange),
      pressure: this.generateMockPressureData(timeRange),
      sunlight: this.generateMockSunlightData(timeRange),
      airQuality: this.generateMockAirQualityData(timeRange)
    };
  }

  generateMockTemperatureData(days) {
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const month = date.getMonth();
      // Simulate seasonal temperature variation
      const baseTemp = 60 + 25 * Math.sin((month - 3) * Math.PI / 6);
      const dailyVariation = (Math.random() - 0.5) * 20;
      data.push({
        date: date,
        temperature: baseTemp + dailyVariation,
        season: this.getSeasonFromMonth(month)
      });
    }
    return data.reverse();
  }

  getSeasonFromMonth(month) {
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'autumn';
  }
}

class StatisticalTests {
  oneWayANOVA(data, groupBy, metric) {
    const groups = {};
    
    // Group data
    data.forEach(item => {
      const group = item[groupBy];
      if (!groups[group]) groups[group] = [];
      groups[group].push(item[metric]);
    });
    
    const groupNames = Object.keys(groups);
    if (groupNames.length < 2) {
      return { error: 'Need at least 2 groups for ANOVA' };
    }
    
    // Calculate group statistics
    const groupStats = {};
    let grandMean = 0;
    let totalN = 0;
    
    groupNames.forEach(group => {
      const values = groups[group];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      groupStats[group] = { mean, n: values.length, values };
      grandMean += mean * values.length;
      totalN += values.length;
    });
    
    grandMean /= totalN;
    
    // Calculate sum of squares
    let ssb = 0; // Between groups
    let ssw = 0; // Within groups
    
    groupNames.forEach(group => {
      const stats = groupStats[group];
      ssb += stats.n * Math.pow(stats.mean - grandMean, 2);
      
      stats.values.forEach(value => {
        ssw += Math.pow(value - stats.mean, 2);
      });
    });
    
    const dfb = groupNames.length - 1;
    const dfw = totalN - groupNames.length;
    const msb = ssb / dfb;
    const msw = ssw / dfw;
    const fStatistic = msw > 0 ? msb / msw : 0;
    
    return {
      fStatistic,
      pValue: this.calculateFPValue(fStatistic, dfb, dfw),
      significant: this.calculateFPValue(fStatistic, dfb, dfw) < 0.05,
      groupStats
    };
  }
  
  calculateFPValue(f, df1, df2) {
    // Simplified p-value calculation (would use proper F-distribution in production)
    if (f > 4) return 0.01;
    if (f > 3) return 0.05;
    if (f > 2) return 0.1;
    return 0.2;
  }
}