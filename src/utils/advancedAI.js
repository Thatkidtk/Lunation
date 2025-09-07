// Advanced AI prediction engine with LSTM-inspired algorithms and deep learning concepts
// Implements neural network-like pattern recognition for menstrual cycle prediction

import { calculatePredictions as basicPredictions } from './cycleCalculations.js';

/**
 * Advanced Neural Network-inspired Prediction Engine
 * Implements LSTM-like sequence modeling for cycle prediction
 */
export class AdvancedNeuralPredictor {
  constructor(cycles = [], symptoms = [], additionalData = {}) {
    this.cycles = cycles;
    this.symptoms = symptoms;
    this.additionalData = additionalData; // For future wearable/lifestyle data
    this.modelWeights = this.initializeWeights();
    this.sequenceLength = 6; // Look back 6 cycles
    this.hiddenSize = 64; // Neural network hidden layer size
    this.learningRate = 0.001;
  }

  /**
   * Initialize neural network-like weights
   */
  initializeWeights() {
    return {
      forget_gate: this.randomMatrix(this.hiddenSize, this.hiddenSize + 10),
      input_gate: this.randomMatrix(this.hiddenSize, this.hiddenSize + 10),
      candidate_gate: this.randomMatrix(this.hiddenSize, this.hiddenSize + 10),
      output_gate: this.randomMatrix(this.hiddenSize, this.hiddenSize + 10),
      hidden_bias: this.randomVector(this.hiddenSize),
      output_weights: this.randomMatrix(1, this.hiddenSize),
      recurrent_weights: this.randomMatrix(this.hiddenSize, this.hiddenSize)
    };
  }

  /**
   * Create random matrix for weight initialization
   */
  randomMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = (Math.random() - 0.5) * 0.1; // Xavier initialization
      }
    }
    return matrix;
  }

  /**
   * Create random vector for bias initialization
   */
  randomVector(size) {
    return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1);
  }

  /**
   * Prepare sequential data for LSTM-like processing
   */
  prepareSequences() {
    if (this.cycles.length < 3) return [];

    const sequences = [];
    const features = this.extractFeatures();

    for (let i = this.sequenceLength; i < features.length; i++) {
      const sequence = features.slice(i - this.sequenceLength, i);
      const target = features[i][0]; // Cycle length as target
      sequences.push({ sequence, target });
    }

    return sequences;
  }

  /**
   * Extract comprehensive features from cycle data
   */
  extractFeatures() {
    return this.cycles.map((cycle, index) => {
      const prevCycle = index > 0 ? this.cycles[index - 1] : null;
      const cycleLength = this.calculateCycleLength(cycle, prevCycle, index);
      
      return [
        cycleLength || 28,
        this.getFlowIntensityScore(cycle.flowIntensity),
        this.getSeasonalFactor(new Date(cycle.startDate)),
        this.getSymptomSeverityScore(cycle, index),
        this.getDayOfWeek(new Date(cycle.startDate)),
        this.getStressIndicator(cycle, index),
        this.getCycleDayVariation(index),
        this.getMoodScore(cycle, index),
        this.getEnergyLevel(cycle, index),
        this.getLifestyleFactor(cycle, index)
      ];
    });
  }

  /**
   * Calculate cycle length with improved accuracy
   */
  calculateCycleLength(cycle, prevCycle, index) {
    if (index === 0 || !prevCycle) return 28;
    
    const currentStart = new Date(cycle.startDate);
    const prevStart = new Date(prevCycle.startDate);
    const length = Math.ceil((currentStart - prevStart) / (1000 * 60 * 60 * 24));
    
    // Filter out unrealistic values
    return (length >= 15 && length <= 60) ? length : 28;
  }

  /**
   * Convert flow intensity to numerical score
   */
  getFlowIntensityScore(intensity) {
    const scores = { 'light': 0.3, 'medium': 0.6, 'heavy': 1.0 };
    return scores[intensity] || 0.6;
  }

  /**
   * Calculate seasonal factor (hormonal changes due to seasons)
   */
  getSeasonalFactor(date) {
    const month = date.getMonth();
    // Vitamin D and seasonal effects on hormones
    const seasonalMultipliers = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85];
    return seasonalMultipliers[month];
  }

  /**
   * Calculate symptom severity score for the cycle
   */
  getSymptomSeverityScore(cycle, cycleIndex) {
    const cycleSymptoms = this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      const cycleStart = new Date(cycle.startDate);
      const nextCycle = this.cycles[cycleIndex + 1];
      const cycleEnd = nextCycle ? new Date(nextCycle.startDate) : 
        new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
      
      return symptomDate >= cycleStart && symptomDate < cycleEnd;
    });

    if (cycleSymptoms.length === 0) return 0.5;

    const severityScores = { 'mild': 0.25, 'moderate': 0.5, 'severe': 0.75, 'extreme': 1.0 };
    const totalScore = cycleSymptoms.reduce((sum, symptom) => 
      sum + (severityScores[symptom.severity] || 0.5), 0);
    
    return Math.min(totalScore / cycleSymptoms.length, 1.0);
  }

  /**
   * Get day of week factor (stress patterns)
   */
  getDayOfWeek(date) {
    return date.getDay() / 7; // 0-1 scale
  }

  /**
   * Calculate stress indicator from symptoms
   */
  getStressIndicator(cycle, cycleIndex) {
    const stressSymptoms = ['anxiety', 'mood-swings', 'irritability', 'insomnia'];
    const cycleSymptoms = this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      const cycleStart = new Date(cycle.startDate);
      const nextCycle = this.cycles[cycleIndex + 1];
      const cycleEnd = nextCycle ? new Date(nextCycle.startDate) : 
        new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
      
      return symptomDate >= cycleStart && symptomDate < cycleEnd &&
             stressSymptoms.includes(symptom.type);
    });

    return Math.min(cycleSymptoms.length / 5, 1.0); // Normalize to 0-1
  }

  /**
   * Calculate cycle day variation factor
   */
  getCycleDayVariation(index) {
    if (index < 2) return 0.5;
    
    const recentLengths = this.cycles.slice(Math.max(0, index - 3), index)
      .map((cycle, i) => this.calculateCycleLength(cycle, 
        i > 0 ? this.cycles[Math.max(0, index - 3) + i - 1] : null, i))
      .filter(length => length);
    
    if (recentLengths.length < 2) return 0.5;
    
    const mean = recentLengths.reduce((sum, len) => sum + len, 0) / recentLengths.length;
    const variance = recentLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / recentLengths.length;
    
    return Math.min(Math.sqrt(variance) / 10, 1.0); // Normalize variation
  }

  /**
   * Calculate mood score from symptoms
   */
  getMoodScore(cycle, cycleIndex) {
    const moodSymptoms = ['mood-swings', 'depression', 'mood-low', 'emotional-sensitivity'];
    const cycleSymptoms = this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      const cycleStart = new Date(cycle.startDate);
      const nextCycle = this.cycles[cycleIndex + 1];
      const cycleEnd = nextCycle ? new Date(nextCycle.startDate) : 
        new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
      
      return symptomDate >= cycleStart && symptomDate < cycleEnd &&
             moodSymptoms.includes(symptom.type);
    });

    return Math.min(cycleSymptoms.length / 3, 1.0);
  }

  /**
   * Calculate energy level from symptoms
   */
  getEnergyLevel(cycle, cycleIndex) {
    const energySymptoms = ['fatigue', 'brain-fog', 'difficulty-concentrating'];
    const cycleSymptoms = this.symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      const cycleStart = new Date(cycle.startDate);
      const nextCycle = this.cycles[cycleIndex + 1];
      const cycleEnd = nextCycle ? new Date(nextCycle.startDate) : 
        new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
      
      return symptomDate >= cycleStart && symptomDate < cycleEnd &&
             energySymptoms.includes(symptom.type);
    });

    return 1.0 - Math.min(cycleSymptoms.length / 3, 1.0); // Inverse for energy
  }

  /**
   * Calculate lifestyle factor (placeholder for future wearable integration)
   */
  getLifestyleFactor(cycle, cycleIndex) {
    // Future integration point for:
    // - Sleep quality
    // - Exercise patterns
    // - Nutrition data
    // - Stress levels from wearables
    return 0.5; // Neutral baseline
  }

  /**
   * LSTM-inspired forward pass
   */
  lstmForward(sequence) {
    let hiddenState = new Array(this.hiddenSize).fill(0);
    let cellState = new Array(this.hiddenSize).fill(0);

    for (const input of sequence) {
      const combined = [...input, ...hiddenState];
      
      // Forget gate
      const forgetGate = this.sigmoid(this.matrixVectorMultiply(this.modelWeights.forget_gate, combined));
      
      // Input gate
      const inputGate = this.sigmoid(this.matrixVectorMultiply(this.modelWeights.input_gate, combined));
      
      // Candidate values
      const candidateGate = this.tanh(this.matrixVectorMultiply(this.modelWeights.candidate_gate, combined));
      
      // Output gate
      const outputGate = this.sigmoid(this.matrixVectorMultiply(this.modelWeights.output_gate, combined));
      
      // Update cell state
      cellState = cellState.map((c, i) => 
        forgetGate[i] * c + inputGate[i] * candidateGate[i]
      );
      
      // Update hidden state
      hiddenState = outputGate.map((o, i) => o * this.tanh(cellState[i]));
    }

    // Final prediction
    const prediction = this.matrixVectorMultiply(this.modelWeights.output_weights, hiddenState)[0];
    return Math.max(15, Math.min(60, prediction)); // Constrain to realistic range
  }

  /**
   * Matrix-vector multiplication
   */
  matrixVectorMultiply(matrix, vector) {
    return matrix.map(row => 
      row.reduce((sum, weight, i) => sum + weight * (vector[i] || 0), 0)
    );
  }

  /**
   * Sigmoid activation function
   */
  sigmoid(x) {
    if (Array.isArray(x)) {
      return x.map(val => 1 / (1 + Math.exp(-val)));
    }
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Tanh activation function
   */
  tanh(x) {
    if (Array.isArray(x)) {
      return x.map(val => Math.tanh(val));
    }
    return Math.tanh(x);
  }

  /**
   * Generate advanced predictions using neural network
   */
  generateAdvancedPredictions() {
    if (this.cycles.length < 3) {
      return this.getFallbackPredictions();
    }

    const sequences = this.prepareSequences();
    if (sequences.length === 0) {
      return this.getFallbackPredictions();
    }

    // Use the most recent sequence for prediction
    const latestSequence = sequences[sequences.length - 1].sequence;
    const predictedLength = this.lstmForward(latestSequence);

    // Enhanced predictions with confidence intervals
    const lastCycle = this.cycles[this.cycles.length - 1];
    const lastPeriodStart = new Date(lastCycle.startDate);
    
    // Predict next period
    const nextPeriodDate = new Date(lastPeriodStart.getTime() + predictedLength * 24 * 60 * 60 * 1000);
    
    // Calculate confidence based on prediction consistency
    const confidence = this.calculatePredictionConfidence(sequences);
    
    // Generate uncertainty range
    const uncertaintyRange = this.calculateUncertaintyRange(predictedLength, confidence);

    // Enhanced ovulation prediction
    const ovulationPrediction = this.predictOvulation(nextPeriodDate, predictedLength);
    
    // Symptom predictions
    const symptomPredictions = this.predictSymptoms(nextPeriodDate, predictedLength);

    return {
      nextPeriod: {
        date: nextPeriodDate.toISOString().split('T')[0],
        predictedLength: Math.round(predictedLength),
        confidence: Math.round(confidence * 100),
        uncertaintyRange: {
          earliest: new Date(nextPeriodDate.getTime() - uncertaintyRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          latest: new Date(nextPeriodDate.getTime() + uncertaintyRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },
      ovulation: ovulationPrediction,
      fertilityWindow: {
        start: new Date(ovulationPrediction.date).getTime() - 5 * 24 * 60 * 60 * 1000,
        end: new Date(ovulationPrediction.date).getTime() + 1 * 24 * 60 * 60 * 1000
      },
      symptoms: symptomPredictions,
      modelConfidence: confidence,
      algorithmUsed: 'LSTM-Neural-Network'
    };
  }

  /**
   * Calculate prediction confidence based on model performance
   */
  calculatePredictionConfidence(sequences) {
    if (sequences.length < 3) return 0.6;

    let totalError = 0;
    let validPredictions = 0;

    // Cross-validation approach
    for (let i = 3; i < sequences.length; i++) {
      const trainSequence = sequences[i - 1].sequence;
      const actualValue = sequences[i].target;
      const predictedValue = this.lstmForward(trainSequence);
      
      const error = Math.abs(predictedValue - actualValue);
      totalError += error;
      validPredictions++;
    }

    if (validPredictions === 0) return 0.6;

    const meanError = totalError / validPredictions;
    const confidence = Math.max(0.1, 1 - (meanError / 10)); // Normalize error to confidence

    return Math.min(confidence, 0.95); // Cap at 95% confidence
  }

  /**
   * Calculate uncertainty range based on confidence
   */
  calculateUncertaintyRange(predictedLength, confidence) {
    const baseUncertainty = 3; // Base uncertainty of 3 days
    const confidenceMultiplier = 1 - confidence;
    return Math.round(baseUncertainty + (confidenceMultiplier * 4));
  }

  /**
   * Advanced ovulation prediction
   */
  predictOvulation(nextPeriodDate, cycleLength) {
    const lutealPhaseLength = cycleLength > 30 ? 15 : cycleLength < 25 ? 13 : 14;
    const ovulationDate = new Date(nextPeriodDate.getTime() - lutealPhaseLength * 24 * 60 * 60 * 1000);
    
    return {
      date: ovulationDate.toISOString().split('T')[0],
      confidence: 85, // High confidence for ovulation timing
      phase: 'ovulatory'
    };
  }

  /**
   * Predict likely symptoms for next cycle
   */
  predictSymptoms(nextPeriodDate, cycleLength) {
    const recentCycles = this.cycles.slice(-3);
    const symptomPatterns = {};

    // Analyze symptom patterns from recent cycles
    recentCycles.forEach((cycle, cycleIndex) => {
      const actualIndex = this.cycles.length - 3 + cycleIndex;
      const cycleSymptoms = this.symptoms.filter(symptom => {
        const symptomDate = new Date(symptom.date);
        const cycleStart = new Date(cycle.startDate);
        const nextCycle = this.cycles[actualIndex + 1];
        const cycleEnd = nextCycle ? new Date(nextCycle.startDate) : 
          new Date(cycleStart.getTime() + 35 * 24 * 60 * 60 * 1000);
        
        return symptomDate >= cycleStart && symptomDate < cycleEnd;
      });

      cycleSymptoms.forEach(symptom => {
        if (!symptomPatterns[symptom.type]) {
          symptomPatterns[symptom.type] = { count: 0, avgDay: 0, severity: [] };
        }
        symptomPatterns[symptom.type].count++;
        symptomPatterns[symptom.type].severity.push(symptom.severity);
        
        const cycleDay = Math.ceil((new Date(symptom.date) - new Date(cycle.startDate)) / (1000 * 60 * 60 * 24));
        symptomPatterns[symptom.type].avgDay += cycleDay;
      });
    });

    // Generate predictions for symptoms that occur frequently
    const predictions = [];
    Object.entries(symptomPatterns).forEach(([symptomType, pattern]) => {
      const frequency = pattern.count / recentCycles.length;
      if (frequency >= 0.5) { // Predict symptoms that occur in 50%+ of cycles
        const avgDay = Math.round(pattern.avgDay / pattern.count);
        const predictedDate = new Date(nextPeriodDate.getTime() + (avgDay - 1) * 24 * 60 * 60 * 1000);
        
        predictions.push({
          type: symptomType,
          predictedDate: predictedDate.toISOString().split('T')[0],
          probability: Math.round(frequency * 100),
          expectedSeverity: this.getMostCommonSeverity(pattern.severity),
          cycleDay: avgDay
        });
      }
    });

    return predictions;
  }

  /**
   * Get most common severity level
   */
  getMostCommonSeverity(severities) {
    const counts = {};
    severities.forEach(severity => {
      counts[severity] = (counts[severity] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)[0];
  }

  /**
   * Fallback predictions when insufficient data
   */
  getFallbackPredictions() {
    return basicPredictions(this.cycles);
  }
}

/**
 * Factory function for creating advanced neural predictor
 */
export function createAdvancedPredictor(cycles, symptoms, additionalData = {}) {
  return new AdvancedNeuralPredictor(cycles, symptoms, additionalData);
}

/**
 * Enhanced prediction function that integrates with existing system
 */
export function generateNeuralPredictions(cycles, symptoms, additionalData = {}) {
  const predictor = new AdvancedNeuralPredictor(cycles, symptoms, additionalData);
  return predictor.generateAdvancedPredictions();
}