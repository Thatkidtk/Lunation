export class PredictionVisualizationEngine {
  constructor() {
    this.confidenceCalculator = new ConfidenceCalculator();
    this.uncertaintyQuantifier = new UncertaintyQuantifier();
    this.visualizationRenderer = new VisualizationRenderer();
    this.interactiveElements = new InteractiveElements();
    this.dataProcessor = new DataProcessor();
    this.colorSchemes = this.initializeColorSchemes();
    this.chartConfigs = this.initializeChartConfigs();
  }

  generatePredictionVisualization(predictionData, options = {}) {
    const processedData = this.dataProcessor.process(predictionData);
    const confidenceMetrics = this.confidenceCalculator.calculate(processedData);
    const uncertaintyRanges = this.uncertaintyQuantifier.quantify(processedData, confidenceMetrics);
    
    const visualization = {
      main: this.createMainPredictionChart(processedData, confidenceMetrics, uncertaintyRanges),
      confidence: this.createConfidenceVisualization(confidenceMetrics),
      uncertainty: this.createUncertaintyVisualization(uncertaintyRanges),
      timeline: this.createTimelineVisualization(processedData, uncertaintyRanges),
      scenarios: this.createScenarioVisualization(processedData),
      interactive: this.interactiveElements.create(processedData, options)
    };
    
    return {
      visualization,
      data: processedData,
      confidence: confidenceMetrics,
      uncertainty: uncertaintyRanges,
      metadata: this.generateMetadata(predictionData, options)
    };
  }

  createMainPredictionChart(data, confidence, uncertainty) {
    const chartData = {
      datasets: [
        {
          label: 'Historical Data',
          data: data.historical.map(point => ({
            x: point.date,
            y: point.value,
            confidence: 1.0
          })),
          borderColor: this.colorSchemes.primary.main,
          backgroundColor: this.colorSchemes.primary.background,
          borderWidth: 2,
          pointRadius: 3,
          fill: false
        },
        {
          label: 'Prediction',
          data: data.predictions.map(point => ({
            x: point.date,
            y: point.value,
            confidence: point.confidence
          })),
          borderColor: this.colorSchemes.prediction.main,
          backgroundColor: this.colorSchemes.prediction.background,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 4,
          pointStyle: 'triangle',
          fill: false
        },
        {
          label: 'Confidence Range (±1σ)',
          data: uncertainty.oneSigma.map(point => ({
            x: point.date,
            y: [point.lower, point.upper]
          })),
          backgroundColor: this.colorSchemes.confidence.light,
          borderColor: 'transparent',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Uncertainty Range (±2σ)',
          data: uncertainty.twoSigma.map(point => ({
            x: point.date,
            y: [point.lower, point.upper]
          })),
          backgroundColor: this.colorSchemes.uncertainty.light,
          borderColor: 'transparent',
          fill: true,
          tension: 0.4
        }
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Cycle Predictions with Confidence Intervals'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              afterBody: (context) => {
                const dataPoint = context[0];
                if (dataPoint.dataset.label === 'Prediction') {
                  const confidence = Math.round(dataPoint.raw.confidence * 100);
                  return `Confidence: ${confidence}%`;
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'MMM DD'
              }
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Cycle Day / Phase'
            },
            beginAtZero: true
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            this.interactiveElements.handleHover(elements[0], event);
          }
        }
      }
    };

    return chartData;
  }

  createConfidenceVisualization(confidenceMetrics) {
    return {
      type: 'confidence_gauge',
      data: {
        overall: confidenceMetrics.overall,
        byTimeframe: confidenceMetrics.byTimeframe,
        byPredictionType: confidenceMetrics.byType,
        factors: confidenceMetrics.contributingFactors
      },
      visualization: {
        gauge: {
          value: confidenceMetrics.overall * 100,
          min: 0,
          max: 100,
          ranges: [
            { from: 0, to: 30, color: this.colorSchemes.confidence.low },
            { from: 30, to: 70, color: this.colorSchemes.confidence.medium },
            { from: 70, to: 100, color: this.colorSchemes.confidence.high }
          ],
          needle: {
            value: confidenceMetrics.overall * 100,
            color: this.colorSchemes.primary.main
          }
        },
        breakdown: {
          labels: Object.keys(confidenceMetrics.byType),
          datasets: [{
            data: Object.values(confidenceMetrics.byType),
            backgroundColor: [
              this.colorSchemes.prediction.main,
              this.colorSchemes.ovulation.main,
              this.colorSchemes.period.main,
              this.colorSchemes.phase.main
            ]
          }]
        }
      }
    };
  }

  createUncertaintyVisualization(uncertaintyRanges) {
    return {
      type: 'uncertainty_bands',
      data: {
        ranges: uncertaintyRanges,
        quantiles: this.calculateQuantiles(uncertaintyRanges),
        distribution: this.calculateDistribution(uncertaintyRanges)
      },
      visualization: {
        bands: {
          datasets: [
            {
              label: '95% Confidence Interval',
              data: uncertaintyRanges.twoSigma,
              backgroundColor: this.colorSchemes.uncertainty.veryLight,
              borderColor: this.colorSchemes.uncertainty.border,
              fill: true
            },
            {
              label: '68% Confidence Interval',
              data: uncertaintyRanges.oneSigma,
              backgroundColor: this.colorSchemes.confidence.light,
              borderColor: this.colorSchemes.confidence.border,
              fill: true
            },
            {
              label: 'Most Likely Outcome',
              data: uncertaintyRanges.median,
              borderColor: this.colorSchemes.prediction.main,
              borderWidth: 3,
              fill: false
            }
          ]
        },
        distribution: {
          type: 'violin',
          data: uncertaintyRanges.distribution,
          options: {
            showDistribution: true,
            showQuantiles: true,
            showMedian: true
          }
        }
      }
    };
  }

  createTimelineVisualization(data, uncertaintyRanges) {
    const timelineData = {
      periods: [],
      ovulations: [],
      phases: [],
      events: []
    };

    // Process predictions into timeline events
    data.predictions.forEach(prediction => {
      const event = {
        date: prediction.date,
        type: prediction.type,
        confidence: prediction.confidence,
        uncertainty: this.getUncertaintyForDate(prediction.date, uncertaintyRanges),
        description: this.generateEventDescription(prediction)
      };

      switch (prediction.type) {
        case 'period':
          timelineData.periods.push(event);
          break;
        case 'ovulation':
          timelineData.ovulations.push(event);
          break;
        case 'phase_change':
          timelineData.phases.push(event);
          break;
        default:
          timelineData.events.push(event);
      }
    });

    return {
      type: 'timeline',
      data: timelineData,
      visualization: {
        timeline: {
          orientation: 'horizontal',
          start: data.timeRange.start,
          end: data.timeRange.end,
          groups: [
            { id: 'periods', content: 'Periods', style: `background-color: ${this.colorSchemes.period.light}` },
            { id: 'ovulations', content: 'Ovulations', style: `background-color: ${this.colorSchemes.ovulation.light}` },
            { id: 'phases', content: 'Phases', style: `background-color: ${this.colorSchemes.phase.light}` },
            { id: 'events', content: 'Other Events', style: `background-color: ${this.colorSchemes.secondary.light}` }
          ],
          items: this.formatTimelineItems(timelineData)
        }
      }
    };
  }

  createScenarioVisualization(data) {
    const scenarios = this.generateScenarios(data);
    
    return {
      type: 'scenario_comparison',
      data: {
        scenarios,
        probabilities: this.calculateScenarioProbabilities(scenarios),
        impacts: this.calculateScenarioImpacts(scenarios)
      },
      visualization: {
        comparison: {
          type: 'multi_line',
          datasets: scenarios.map((scenario, index) => ({
            label: scenario.name,
            data: scenario.timeline,
            borderColor: this.colorSchemes.scenarios[index % this.colorSchemes.scenarios.length],
            backgroundColor: this.colorSchemes.scenarios[index % this.colorSchemes.scenarios.length] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }))
        },
        probability: {
          type: 'bar',
          data: {
            labels: scenarios.map(s => s.name),
            datasets: [{
              label: 'Probability',
              data: scenarios.map(s => s.probability * 100),
              backgroundColor: scenarios.map((s, i) => 
                this.colorSchemes.scenarios[i % this.colorSchemes.scenarios.length]
              )
            }]
          }
        }
      }
    };
  }

  generateScenarios(data) {
    const baseScenario = {
      name: 'Most Likely',
      description: 'Based on current patterns and historical data',
      probability: 0.6,
      timeline: data.predictions
    };

    const optimisticScenario = {
      name: 'Optimistic',
      description: 'Assuming ideal conditions and high tracking accuracy',
      probability: 0.2,
      timeline: this.adjustPredictions(data.predictions, 'optimistic')
    };

    const pessimisticScenario = {
      name: 'Conservative',
      description: 'Accounting for potential disruptions and variations',
      probability: 0.2,
      timeline: this.adjustPredictions(data.predictions, 'pessimistic')
    };

    return [baseScenario, optimisticScenario, pessimisticScenario];
  }

  adjustPredictions(predictions, adjustment) {
    return predictions.map(prediction => {
      const adjusted = { ...prediction };
      
      switch (adjustment) {
        case 'optimistic':
          adjusted.confidence = Math.min(1.0, prediction.confidence * 1.2);
          adjusted.uncertainty = prediction.uncertainty * 0.8;
          break;
        case 'pessimistic':
          adjusted.confidence = prediction.confidence * 0.8;
          adjusted.uncertainty = prediction.uncertainty * 1.3;
          break;
      }
      
      return adjusted;
    });
  }

  formatTimelineItems(timelineData) {
    const items = [];
    
    // Add periods
    timelineData.periods.forEach((period, index) => {
      items.push({
        id: `period_${index}`,
        group: 'periods',
        content: this.createTimelineContent('period', period),
        start: period.date,
        end: new Date(period.date.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
        className: 'period-event',
        title: `Period (Confidence: ${Math.round(period.confidence * 100)}%)`
      });
    });
    
    // Add ovulations
    timelineData.ovulations.forEach((ovulation, index) => {
      items.push({
        id: `ovulation_${index}`,
        group: 'ovulations',
        content: this.createTimelineContent('ovulation', ovulation),
        start: ovulation.date,
        type: 'point',
        className: 'ovulation-event',
        title: `Ovulation (Confidence: ${Math.round(ovulation.confidence * 100)}%)`
      });
    });
    
    return items;
  }

  createTimelineContent(type, event) {
    const confidencePercentage = Math.round(event.confidence * 100);
    const uncertaintyDays = Math.round(event.uncertainty || 0);
    
    let content = '';
    switch (type) {
      case 'period':
        content = `<div class="timeline-period">
          <strong>Period</strong><br/>
          <small>${confidencePercentage}% confidence</small>
          ${uncertaintyDays > 0 ? `<br/><small>±${uncertaintyDays} days</small>` : ''}
        </div>`;
        break;
      case 'ovulation':
        content = `<div class="timeline-ovulation">
          <strong>Ovulation</strong><br/>
          <small>${confidencePercentage}% confidence</small>
          ${uncertaintyDays > 0 ? `<br/><small>±${uncertaintyDays} days</small>` : ''}
        </div>`;
        break;
    }
    
    return content;
  }

  generateEventDescription(prediction) {
    const confidence = Math.round(prediction.confidence * 100);
    const uncertainty = Math.round(prediction.uncertainty || 0);
    
    let description = `${prediction.type} predicted with ${confidence}% confidence`;
    if (uncertainty > 0) {
      description += ` (±${uncertainty} days uncertainty)`;
    }
    
    return description;
  }

  initializeColorSchemes() {
    return {
      primary: {
        main: '#6366f1',
        light: '#a5b4fc',
        dark: '#4338ca',
        background: 'rgba(99, 102, 241, 0.1)'
      },
      prediction: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        background: 'rgba(245, 158, 11, 0.1)'
      },
      confidence: {
        high: '#10b981',
        medium: '#f59e0b',
        low: '#ef4444',
        light: 'rgba(16, 185, 129, 0.2)',
        border: 'rgba(16, 185, 129, 0.5)'
      },
      uncertainty: {
        light: 'rgba(156, 163, 175, 0.2)',
        veryLight: 'rgba(156, 163, 175, 0.1)',
        border: 'rgba(156, 163, 175, 0.3)'
      },
      period: {
        main: '#dc2626',
        light: '#fecaca',
        dark: '#991b1b'
      },
      ovulation: {
        main: '#059669',
        light: '#a7f3d0',
        dark: '#047857'
      },
      phase: {
        main: '#7c3aed',
        light: '#c4b5fd',
        dark: '#5b21b6'
      },
      secondary: {
        main: '#64748b',
        light: '#cbd5e1',
        dark: '#334155'
      },
      scenarios: [
        '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'
      ]
    };
  }

  initializeChartConfigs() {
    return {
      defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            type: 'time'
          },
          y: {
            beginAtZero: true
          }
        }
      },
      confidenceGauge: {
        type: 'doughnut',
        options: {
          circumference: 180,
          rotation: 270,
          cutout: '80%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      }
    };
  }
}

class ConfidenceCalculator {
  constructor() {
    this.factors = this.initializeConfidenceFactors();
  }

  calculate(processedData) {
    const historicalAccuracy = this.calculateHistoricalAccuracy(processedData);
    const dataQuality = this.assessDataQuality(processedData);
    const patternConsistency = this.assessPatternConsistency(processedData);
    const timeframeReliability = this.assessTimeframeReliability(processedData);
    
    const confidence = {
      overall: this.calculateOverallConfidence({
        historicalAccuracy,
        dataQuality,
        patternConsistency,
        timeframeReliability
      }),
      byTimeframe: this.calculateTimeframeConfidence(processedData),
      byType: this.calculateTypeConfidence(processedData),
      contributingFactors: {
        historicalAccuracy,
        dataQuality,
        patternConsistency,
        timeframeReliability
      },
      breakdown: this.generateConfidenceBreakdown(processedData)
    };
    
    return confidence;
  }

  calculateOverallConfidence(factors) {
    const weights = {
      historicalAccuracy: 0.35,
      dataQuality: 0.25,
      patternConsistency: 0.25,
      timeframeReliability: 0.15
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([factor, weight]) => {
      if (factors[factor] !== undefined) {
        weightedSum += factors[factor] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  calculateHistoricalAccuracy(data) {
    if (!data.historicalPredictions || data.historicalPredictions.length === 0) {
      return 0.6; // Default moderate confidence
    }
    
    const accuracyScores = data.historicalPredictions.map(prediction => {
      if (!prediction.actual) return null;
      
      const daysDifference = Math.abs(
        (new Date(prediction.predicted) - new Date(prediction.actual)) / (1000 * 60 * 60 * 24)
      );
      
      // Accuracy decreases exponentially with days difference
      return Math.max(0, Math.exp(-daysDifference / 3));
    }).filter(score => score !== null);
    
    if (accuracyScores.length === 0) return 0.6;
    
    return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
  }

  assessDataQuality(data) {
    let qualityScore = 1.0;
    
    // Data completeness
    const completeness = this.calculateDataCompleteness(data);
    qualityScore *= completeness;
    
    // Data consistency
    const consistency = this.calculateDataConsistency(data);
    qualityScore *= consistency;
    
    // Data recency
    const recency = this.calculateDataRecency(data);
    qualityScore *= recency;
    
    // Missing data penalty
    const missingDataPenalty = this.calculateMissingDataPenalty(data);
    qualityScore *= (1 - missingDataPenalty);
    
    return Math.max(0, Math.min(1, qualityScore));
  }

  calculateDataCompleteness(data) {
    if (!data.historical || data.historical.length === 0) return 0.3;
    
    const expectedDataPoints = this.calculateExpectedDataPoints(data.timeRange);
    const actualDataPoints = data.historical.length;
    
    return Math.min(1, actualDataPoints / expectedDataPoints);
  }

  assessPatternConsistency(data) {
    if (!data.patterns || data.patterns.length < 3) return 0.5;
    
    const cycleLengths = data.patterns.map(pattern => pattern.cycleLength);
    const mean = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 1 - (standardDeviation / mean));
    
    return consistencyScore;
  }

  calculateTimeframeConfidence(data) {
    return {
      nextWeek: this.calculateShortTermConfidence(data, 7),
      nextMonth: this.calculateMediumTermConfidence(data, 30),
      next3Months: this.calculateLongTermConfidence(data, 90)
    };
  }

  calculateShortTermConfidence(data, days) {
    const baseConfidence = this.calculateOverallConfidence(data);
    
    // Short-term predictions are generally more accurate
    const timeframeFactor = 1.2;
    
    return Math.min(1, baseConfidence * timeframeFactor);
  }

  calculateMediumTermConfidence(data, days) {
    const baseConfidence = this.calculateOverallConfidence(data);
    
    // Medium-term predictions have moderate accuracy
    const timeframeFactor = 1.0;
    
    return baseConfidence * timeframeFactor;
  }

  calculateLongTermConfidence(data, days) {
    const baseConfidence = this.calculateOverallConfidence(data);
    
    // Long-term predictions are less accurate
    const timeframeFactor = 0.7;
    
    return baseConfidence * timeframeFactor;
  }

  initializeConfidenceFactors() {
    return {
      dataQuality: {
        weight: 0.25,
        factors: ['completeness', 'consistency', 'accuracy', 'recency']
      },
      historicalAccuracy: {
        weight: 0.35,
        factors: ['prediction_accuracy', 'pattern_stability', 'validation_results']
      },
      patternConsistency: {
        weight: 0.25,
        factors: ['cycle_regularity', 'symptom_patterns', 'hormonal_patterns']
      },
      timeframeReliability: {
        weight: 0.15,
        factors: ['short_term_accuracy', 'long_term_drift', 'seasonal_factors']
      }
    };
  }
}

class UncertaintyQuantifier {
  constructor() {
    this.models = this.initializeUncertaintyModels();
  }

  quantify(data, confidence) {
    const uncertaintyMetrics = {
      oneSigma: this.calculateOneSigmaRange(data, confidence),
      twoSigma: this.calculateTwoSigmaRange(data, confidence),
      median: this.calculateMedianPrediction(data),
      distribution: this.calculatePredictionDistribution(data, confidence),
      scenarios: this.calculateScenarioUncertainty(data, confidence)
    };
    
    return uncertaintyMetrics;
  }

  calculateOneSigmaRange(data, confidence) {
    return data.predictions.map(prediction => {
      const baseUncertainty = this.calculateBaseUncertainty(prediction, confidence);
      const uncertaintyDays = baseUncertainty * (1 - prediction.confidence);
      
      return {
        date: prediction.date,
        lower: new Date(prediction.date.getTime() - uncertaintyDays * 24 * 60 * 60 * 1000),
        upper: new Date(prediction.date.getTime() + uncertaintyDays * 24 * 60 * 60 * 1000),
        uncertainty: uncertaintyDays
      };
    });
  }

  calculateTwoSigmaRange(data, confidence) {
    return data.predictions.map(prediction => {
      const baseUncertainty = this.calculateBaseUncertainty(prediction, confidence);
      const uncertaintyDays = baseUncertainty * 2 * (1 - prediction.confidence);
      
      return {
        date: prediction.date,
        lower: new Date(prediction.date.getTime() - uncertaintyDays * 24 * 60 * 60 * 1000),
        upper: new Date(prediction.date.getTime() + uncertaintyDays * 24 * 60 * 60 * 1000),
        uncertainty: uncertaintyDays
      };
    });
  }

  calculateBaseUncertainty(prediction, confidence) {
    const typeUncertainties = {
      'period': 3, // ±3 days base uncertainty for period predictions
      'ovulation': 2, // ±2 days base uncertainty for ovulation
      'phase_change': 1, // ±1 day base uncertainty for phase changes
      'symptom': 2 // ±2 days for symptom predictions
    };
    
    const baseUncertainty = typeUncertainties[prediction.type] || 2;
    const confidenceFactor = 1 - confidence.overall;
    
    return baseUncertainty * (1 + confidenceFactor);
  }

  calculatePredictionDistribution(data, confidence) {
    return data.predictions.map(prediction => {
      const distribution = this.generateProbabilityDistribution(prediction, confidence);
      
      return {
        date: prediction.date,
        distribution: distribution,
        percentiles: this.calculatePercentiles(distribution),
        mode: this.calculateMode(distribution),
        skewness: this.calculateSkewness(distribution)
      };
    });
  }

  generateProbabilityDistribution(prediction, confidence) {
    const uncertainty = this.calculateBaseUncertainty(prediction, confidence);
    const standardDeviation = uncertainty / 2; // Approximate standard deviation
    
    const distribution = [];
    const numPoints = 100;
    
    for (let i = 0; i < numPoints; i++) {
      const daysOffset = (i - numPoints / 2) * (uncertainty * 4) / numPoints;
      const date = new Date(prediction.date.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      
      // Calculate probability using normal distribution
      const probability = this.normalProbabilityDensity(daysOffset, 0, standardDeviation);
      
      distribution.push({
        date: date,
        daysOffset: daysOffset,
        probability: probability
      });
    }
    
    return distribution;
  }

  normalProbabilityDensity(x, mean, standardDeviation) {
    const coefficient = 1 / (standardDeviation * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mean) / standardDeviation, 2);
    return coefficient * Math.exp(exponent);
  }

  calculatePercentiles(distribution) {
    const sortedProbs = distribution.sort((a, b) => a.daysOffset - b.daysOffset);
    const cumulativeProbs = this.calculateCumulativeProbabilities(sortedProbs);
    
    return {
      p5: this.findPercentile(sortedProbs, cumulativeProbs, 0.05),
      p25: this.findPercentile(sortedProbs, cumulativeProbs, 0.25),
      p50: this.findPercentile(sortedProbs, cumulativeProbs, 0.50),
      p75: this.findPercentile(sortedProbs, cumulativeProbs, 0.75),
      p95: this.findPercentile(sortedProbs, cumulativeProbs, 0.95)
    };
  }

  initializeUncertaintyModels() {
    return {
      bayesian: {
        name: 'Bayesian Uncertainty',
        description: 'Uses Bayesian inference to quantify prediction uncertainty'
      },
      ensemble: {
        name: 'Ensemble Uncertainty',
        description: 'Uncertainty from multiple prediction models'
      },
      temporal: {
        name: 'Temporal Uncertainty',
        description: 'Uncertainty increases with prediction horizon'
      }
    };
  }
}

class VisualizationRenderer {
  constructor() {
    this.canvasContexts = new Map();
    this.renderingOptions = this.initializeRenderingOptions();
  }

  render(visualizationData, container) {
    const renderer = this.selectRenderer(visualizationData.type);
    return renderer(visualizationData, container);
  }

  selectRenderer(type) {
    const renderers = {
      'line_chart': this.renderLineChart.bind(this),
      'confidence_gauge': this.renderConfidenceGauge.bind(this),
      'uncertainty_bands': this.renderUncertaintyBands.bind(this),
      'timeline': this.renderTimeline.bind(this),
      'scenario_comparison': this.renderScenarioComparison.bind(this)
    };
    
    return renderers[type] || this.renderDefault.bind(this);
  }

  renderLineChart(data, container) {
    // Implement Chart.js line chart rendering
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: data.visualization.datasets,
      options: data.visualization.options || this.renderingOptions.lineChart
    });
    
    return chart;
  }

  renderConfidenceGauge(data, container) {
    // Implement gauge chart rendering
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Custom gauge rendering logic
    this.drawGauge(ctx, data.visualization.gauge);
    
    return { canvas, context: ctx };
  }

  drawGauge(ctx, gaugeData) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Draw gauge ranges
    gaugeData.ranges.forEach(range => {
      const startAngle = Math.PI + (range.from / 100) * Math.PI;
      const endAngle = Math.PI + (range.to / 100) * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = range.color;
      ctx.lineWidth = 20;
      ctx.stroke();
    });
    
    // Draw needle
    const needleAngle = Math.PI + (gaugeData.needle.value / 100) * Math.PI;
    const needleX = centerX + (radius - 10) * Math.cos(needleAngle);
    const needleY = centerY + (radius - 10) * Math.sin(needleAngle);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = gaugeData.needle.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = gaugeData.needle.color;
    ctx.fill();
    
    // Draw value text
    ctx.fillStyle = '#374151';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(gaugeData.needle.value)}%`, centerX, centerY + 40);
  }

  initializeRenderingOptions() {
    return {
      lineChart: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      },
      gauge: {
        responsive: true,
        cutout: '80%'
      }
    };
  }
}

class InteractiveElements {
  constructor() {
    this.interactions = new Map();
    this.callbacks = new Map();
  }

  create(data, options) {
    const interactive = {
      hover: this.createHoverInteractions(data),
      click: this.createClickInteractions(data),
      zoom: this.createZoomInteractions(data),
      filter: this.createFilterInteractions(data),
      tooltip: this.createTooltipInteractions(data)
    };
    
    return interactive;
  }

  createHoverInteractions(data) {
    return {
      onHover: (elements, event) => {
        if (elements.length > 0) {
          const element = elements[0];
          const dataPoint = data.predictions[element.index];
          
          this.showDetailedInfo(dataPoint, event.x, event.y);
        }
      },
      onLeave: () => {
        this.hideDetailedInfo();
      }
    };
  }

  createClickInteractions(data) {
    return {
      onClick: (elements, event) => {
        if (elements.length > 0) {
          const element = elements[0];
          const dataPoint = data.predictions[element.index];
          
          this.showPredictionDetails(dataPoint);
        }
      }
    };
  }

  showDetailedInfo(dataPoint, x, y) {
    const tooltip = this.getOrCreateTooltip();
    
    tooltip.innerHTML = `
      <div class="prediction-tooltip">
        <strong>${dataPoint.type}</strong><br/>
        <strong>Date:</strong> ${dataPoint.date.toLocaleDateString()}<br/>
        <strong>Confidence:</strong> ${Math.round(dataPoint.confidence * 100)}%<br/>
        <strong>Uncertainty:</strong> ±${Math.round(dataPoint.uncertainty || 0)} days
      </div>
    `;
    
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;
    tooltip.style.display = 'block';
  }

  getOrCreateTooltip() {
    let tooltip = document.getElementById('prediction-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'prediction-tooltip';
      tooltip.className = 'prediction-tooltip-container';
      tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        display: none;
        z-index: 1000;
      `;
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }
}

class DataProcessor {
  constructor() {
    this.processingPipeline = this.initializeProcessingPipeline();
  }

  process(rawData) {
    const processed = {
      historical: this.processHistoricalData(rawData.historical || []),
      predictions: this.processPredictions(rawData.predictions || []),
      patterns: this.processPatterns(rawData.patterns || []),
      timeRange: this.calculateTimeRange(rawData),
      metadata: this.extractMetadata(rawData)
    };
    
    return processed;
  }

  processHistoricalData(historical) {
    return historical.map(point => ({
      date: new Date(point.date),
      value: point.value,
      type: point.type,
      confidence: 1.0, // Historical data has full confidence
      metadata: point.metadata || {}
    })).sort((a, b) => a.date - b.date);
  }

  processPredictions(predictions) {
    return predictions.map(prediction => ({
      date: new Date(prediction.date),
      value: prediction.value,
      type: prediction.type,
      confidence: prediction.confidence || 0.5,
      uncertainty: prediction.uncertainty || 0,
      factors: prediction.factors || [],
      metadata: prediction.metadata || {}
    })).sort((a, b) => a.date - b.date);
  }

  calculateTimeRange(data) {
    const allDates = [
      ...(data.historical || []).map(p => new Date(p.date)),
      ...(data.predictions || []).map(p => new Date(p.date))
    ];
    
    if (allDates.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      };
    }
    
    return {
      start: new Date(Math.min(...allDates)),
      end: new Date(Math.max(...allDates))
    };
  }

  initializeProcessingPipeline() {
    return {
      validation: this.validateData.bind(this),
      normalization: this.normalizeData.bind(this),
      enhancement: this.enhanceData.bind(this),
      aggregation: this.aggregateData.bind(this)
    };
  }

  validateData(data) {
    const issues = [];
    
    if (!data.predictions || data.predictions.length === 0) {
      issues.push('No predictions provided');
    }
    
    return { isValid: issues.length === 0, issues };
  }
}