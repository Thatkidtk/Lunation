export class VoiceInputManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.speechProcessor = new SpeechProcessor();
    this.nlpEngine = new NaturalLanguageProcessor();
    this.contextManager = new VoiceContextManager();
    this.commandProcessor = new VoiceCommandProcessor();
    this.audioFeedback = new AudioFeedbackSystem();
    this.privacyManager = new VoicePrivacyManager();
    this.initializeVoiceRecognition();
  }

  initializeVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;
    
    this.recognition.onstart = () => this.handleStart();
    this.recognition.onresult = (event) => this.handleResult(event);
    this.recognition.onerror = (event) => this.handleError(event);
    this.recognition.onend = () => this.handleEnd();
  }

  startListening(options = {}) {
    if (!this.recognition) {
      throw new Error('Voice recognition not available');
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.contextManager.setContext(options.context || 'general');
    this.privacyManager.startSecureSession();
    
    try {
      this.recognition.start();
      this.audioFeedback.playStartSound();
      return { success: true, message: 'Voice input started' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.audioFeedback.playStopSound();
      this.privacyManager.endSecureSession();
    }
  }

  handleStart() {
    this.isListening = true;
    this.onStateChange?.({ state: 'listening', message: 'Listening...' });
  }

  handleResult(event) {
    const results = Array.from(event.results);
    const latestResult = results[results.length - 1];
    
    if (latestResult) {
      const transcript = latestResult[0].transcript;
      const confidence = latestResult[0].confidence;
      const isFinal = latestResult.isFinal;
      
      if (isFinal) {
        this.processFinalResult(transcript, confidence);
      } else {
        this.processInterimResult(transcript, confidence);
      }
    }
  }

  processFinalResult(transcript, confidence) {
    const processedInput = this.speechProcessor.process(transcript, confidence);
    const nlpResult = this.nlpEngine.analyze(processedInput);
    const command = this.commandProcessor.interpret(nlpResult);
    
    if (command.isValid) {
      this.executeCommand(command);
      this.audioFeedback.playSuccessSound();
    } else {
      this.handleUnrecognizedInput(transcript, nlpResult);
      this.audioFeedback.playErrorSound();
    }
    
    this.onResult?.({
      transcript,
      confidence,
      command,
      processed: processedInput,
      nlp: nlpResult
    });
  }

  processInterimResult(transcript, confidence) {
    this.onInterim?.({
      transcript,
      confidence,
      preview: this.nlpEngine.preview(transcript)
    });
  }

  executeCommand(command) {
    switch (command.type) {
      case 'log_symptom':
        return this.logSymptom(command.data);
      case 'log_mood':
        return this.logMood(command.data);
      case 'log_medication':
        return this.logMedication(command.data);
      case 'log_temperature':
        return this.logTemperature(command.data);
      case 'log_flow':
        return this.logFlow(command.data);
      case 'query_prediction':
        return this.queryPrediction(command.data);
      case 'set_reminder':
        return this.setReminder(command.data);
      case 'navigation':
        return this.navigate(command.data);
      default:
        return this.handleUnknownCommand(command);
    }
  }

  logSymptom(data) {
    const symptomEntry = {
      type: 'symptom',
      timestamp: Date.now(),
      symptoms: data.symptoms,
      severity: data.severity,
      notes: data.notes,
      inputMethod: 'voice',
      confidence: data.confidence
    };
    
    this.onCommandExecuted?.({
      type: 'log_symptom',
      data: symptomEntry,
      message: `Logged ${data.symptoms.join(', ')} with severity ${data.severity}`
    });
    
    return symptomEntry;
  }

  logMood(data) {
    const moodEntry = {
      type: 'mood',
      timestamp: Date.now(),
      overall: data.overall,
      emotions: data.emotions,
      energy: data.energy,
      notes: data.notes,
      inputMethod: 'voice',
      confidence: data.confidence
    };
    
    this.onCommandExecuted?.({
      type: 'log_mood',
      data: moodEntry,
      message: `Logged mood: ${data.overall}/10, energy: ${data.energy}/10`
    });
    
    return moodEntry;
  }

  logMedication(data) {
    const medicationEntry = {
      type: 'medication',
      timestamp: Date.now(),
      medication: data.medication,
      dosage: data.dosage,
      taken: data.taken !== false,
      effectiveness: data.effectiveness,
      sideEffects: data.sideEffects,
      inputMethod: 'voice',
      confidence: data.confidence
    };
    
    this.onCommandExecuted?.({
      type: 'log_medication',
      data: medicationEntry,
      message: `Logged ${data.medication} ${data.taken ? 'taken' : 'missed'}`
    });
    
    return medicationEntry;
  }

  logTemperature(data) {
    const temperatureEntry = {
      type: 'temperature',
      timestamp: Date.now(),
      temperature: data.temperature,
      unit: data.unit || 'fahrenheit',
      timeOfMeasurement: data.timeOfMeasurement,
      inputMethod: 'voice',
      confidence: data.confidence
    };
    
    this.onCommandExecuted?.({
      type: 'log_temperature',
      data: temperatureEntry,
      message: `Logged temperature: ${data.temperature}°${data.unit === 'celsius' ? 'C' : 'F'}`
    });
    
    return temperatureEntry;
  }

  handleError(event) {
    let errorMessage = 'Voice recognition error';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try speaking more clearly.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not available. Please check permissions.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please enable microphone permissions.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `Voice recognition error: ${event.error}`;
    }
    
    this.onError?.({ error: event.error, message: errorMessage });
    this.audioFeedback.playErrorSound();
  }

  handleEnd() {
    this.isListening = false;
    this.onStateChange?.({ state: 'stopped', message: 'Voice input stopped' });
    this.privacyManager.endSecureSession();
  }

  getCapabilities() {
    return {
      isSupported: !!this.recognition,
      supportedCommands: this.commandProcessor.getSupportedCommands(),
      supportedLanguages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
      features: {
        continuousRecognition: true,
        interimResults: true,
        multipleAlternatives: true,
        confidenceScores: true,
        contextAwareness: true,
        privacyProtection: true
      }
    };
  }

  setLanguage(language) {
    if (this.recognition) {
      this.recognition.lang = language;
      this.nlpEngine.setLanguage(language);
    }
  }

  exportVoiceData() {
    return {
      sessions: this.privacyManager.getAnonymizedSessions(),
      commands: this.commandProcessor.getCommandHistory(),
      performance: this.getPerformanceMetrics(),
      metadata: {
        totalSessions: this.privacyManager.getSessionCount(),
        averageAccuracy: this.getAverageAccuracy(),
        mostUsedCommands: this.commandProcessor.getMostUsedCommands()
      }
    };
  }

  getPerformanceMetrics() {
    return {
      averageConfidence: this.speechProcessor.getAverageConfidence(),
      recognitionAccuracy: this.speechProcessor.getAccuracy(),
      commandSuccessRate: this.commandProcessor.getSuccessRate(),
      averageProcessingTime: this.speechProcessor.getAverageProcessingTime()
    };
  }
}

class SpeechProcessor {
  constructor() {
    this.processedInputs = [];
    this.noiseFilter = new NoiseFilter();
    this.confidenceThreshold = 0.7;
  }

  process(transcript, confidence) {
    const cleaned = this.cleanTranscript(transcript);
    const filtered = this.noiseFilter.filter(cleaned);
    const enhanced = this.enhanceTranscript(filtered, confidence);
    
    const processed = {
      original: transcript,
      cleaned,
      filtered,
      enhanced,
      confidence,
      quality: this.assessQuality(enhanced, confidence),
      timestamp: Date.now()
    };
    
    this.processedInputs.push(processed);
    return processed;
  }

  cleanTranscript(transcript) {
    return transcript
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  enhanceTranscript(transcript, confidence) {
    // Apply corrections based on medical/health context
    const corrections = {
      'period': ['piriod', 'peroid', 'piriad'],
      'cramps': ['craps', 'cramps'],
      'headache': ['headac', 'hedache'],
      'nausea': ['nausious', 'nawsea'],
      'fatigue': ['fatieg', 'fatige'],
      'bloating': ['bloting', 'bloatting'],
      'mood': ['mod', 'muud'],
      'energy': ['enery', 'eneregy'],
      'temperature': ['temperatur', 'temp'],
      'medication': ['medicaton', 'medecation']
    };
    
    let enhanced = transcript;
    Object.entries(corrections).forEach(([correct, alternatives]) => {
      alternatives.forEach(alt => {
        const regex = new RegExp(`\\b${alt}\\b`, 'gi');
        enhanced = enhanced.replace(regex, correct);
      });
    });
    
    return enhanced;
  }

  assessQuality(transcript, confidence) {
    let quality = confidence;
    
    // Penalize very short inputs
    if (transcript.length < 5) quality *= 0.7;
    
    // Penalize inputs with many repeated words
    const words = transcript.split(' ');
    const uniqueWords = new Set(words);
    const repetitionFactor = uniqueWords.size / words.length;
    quality *= repetitionFactor;
    
    return Math.max(0, Math.min(1, quality));
  }

  getAverageConfidence() {
    if (this.processedInputs.length === 0) return 0;
    
    const totalConfidence = this.processedInputs.reduce((sum, input) => sum + input.confidence, 0);
    return totalConfidence / this.processedInputs.length;
  }

  getAccuracy() {
    // Simplified accuracy calculation based on successful command executions
    const successfulInputs = this.processedInputs.filter(input => input.quality > 0.8);
    return this.processedInputs.length > 0 ? successfulInputs.length / this.processedInputs.length : 0;
  }

  getAverageProcessingTime() {
    // Placeholder - would measure actual processing time in production
    return 150; // milliseconds
  }
}

class NaturalLanguageProcessor {
  constructor() {
    this.patterns = this.initializePatterns();
    this.entities = this.initializeEntities();
    this.context = null;
    this.language = 'en-US';
  }

  analyze(processedInput) {
    const transcript = processedInput.enhanced;
    
    const analysis = {
      intent: this.extractIntent(transcript),
      entities: this.extractEntities(transcript),
      sentiment: this.analyzeSentiment(transcript),
      confidence: this.calculateOverallConfidence(processedInput, transcript),
      context: this.determineContext(transcript),
      actionable: this.isActionable(transcript)
    };
    
    return analysis;
  }

  extractIntent(transcript) {
    const intents = {
      'log_symptom': [
        /(?:i have|experiencing|feeling)\s+(.+?)(?:today|now|currently)/,
        /(?:log|record|add)\s+(?:symptom|symptoms?)\s+(.+)/,
        /(.+?)\s+(?:pain|ache|cramps?|headache)/
      ],
      'log_mood': [
        /(?:i feel|feeling|mood is)\s+(.+)/,
        /(?:log|record)\s+mood\s+(.+)/,
        /my energy (?:is|level is)\s+(.+)/
      ],
      'log_medication': [
        /(?:i took|took|taking)\s+(.+?)(?:medication|med|pill)/,
        /(?:log|record)\s+(?:medication|med)\s+(.+)/,
        /(?:missed|skipped)\s+(.+?)(?:medication|med|dose)/
      ],
      'log_temperature': [
        /(?:temperature is|temp is|my temperature)\s+(.+)/,
        /(?:log|record)\s+temperature\s+(.+)/
      ],
      'query_prediction': [
        /when (?:is|will)\s+(?:my|next)\s+(.+)/,
        /predict(?:ion)?\s+(.+)/,
        /when (?:am i|will i)\s+(.+)/
      ],
      'set_reminder': [
        /remind me\s+(.+)/,
        /set (?:a )?reminder\s+(.+)/
      ]
    };
    
    for (const [intent, patterns] of Object.entries(intents)) {
      for (const pattern of patterns) {
        const match = transcript.match(pattern);
        if (match) {
          return {
            type: intent,
            confidence: 0.8,
            matchedText: match[0],
            extractedData: match[1]
          };
        }
      }
    }
    
    return {
      type: 'unknown',
      confidence: 0.1,
      matchedText: null,
      extractedData: null
    };
  }

  extractEntities(transcript) {
    const entities = {};
    
    // Extract symptoms
    const symptoms = this.extractSymptoms(transcript);
    if (symptoms.length > 0) entities.symptoms = symptoms;
    
    // Extract numbers (for ratings, temperatures, etc.)
    const numbers = this.extractNumbers(transcript);
    if (numbers.length > 0) entities.numbers = numbers;
    
    // Extract medications
    const medications = this.extractMedications(transcript);
    if (medications.length > 0) entities.medications = medications;
    
    // Extract time expressions
    const timeExpressions = this.extractTimeExpressions(transcript);
    if (timeExpressions.length > 0) entities.timeExpressions = timeExpressions;
    
    return entities;
  }

  extractSymptoms(transcript) {
    const symptomPatterns = [
      'headache', 'migraine', 'cramps', 'cramping', 'bloating', 'nausea',
      'fatigue', 'tired', 'exhausted', 'pain', 'ache', 'sore', 'tender',
      'mood swings', 'irritable', 'anxious', 'sad', 'happy', 'energetic',
      'breast tenderness', 'acne', 'breakouts', 'cravings', 'hungry'
    ];
    
    const found = [];
    symptomPatterns.forEach(symptom => {
      const regex = new RegExp(`\\b${symptom}\\b`, 'gi');
      if (regex.test(transcript)) {
        found.push(symptom);
      }
    });
    
    return found;
  }

  extractNumbers(transcript) {
    const numberRegex = /\b(?:\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
    const matches = transcript.match(numberRegex) || [];
    
    return matches.map(match => {
      const num = parseFloat(match);
      return isNaN(num) ? this.wordToNumber(match) : num;
    }).filter(num => !isNaN(num));
  }

  wordToNumber(word) {
    const wordNumbers = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    
    return wordNumbers[word.toLowerCase()] || NaN;
  }

  extractMedications(transcript) {
    // Common medication names and patterns
    const medicationPatterns = [
      'ibuprofen', 'advil', 'tylenol', 'acetaminophen', 'aspirin',
      'birth control', 'pill', 'medication', 'supplement', 'vitamin'
    ];
    
    const found = [];
    medicationPatterns.forEach(med => {
      const regex = new RegExp(`\\b${med}\\b`, 'gi');
      if (regex.test(transcript)) {
        found.push(med);
      }
    });
    
    return found;
  }

  analyzeSentiment(transcript) {
    const positiveWords = ['good', 'great', 'better', 'fine', 'well', 'happy', 'energetic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'pain', 'hurt', 'sad', 'tired'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (transcript.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (transcript.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return { sentiment: 'neutral', confidence: 0.5 };
    
    const positiveRatio = positiveCount / total;
    
    if (positiveRatio > 0.6) {
      return { sentiment: 'positive', confidence: 0.7 };
    } else if (positiveRatio < 0.4) {
      return { sentiment: 'negative', confidence: 0.7 };
    } else {
      return { sentiment: 'neutral', confidence: 0.6 };
    }
  }

  preview(transcript) {
    // Quick preview without full processing
    const intent = this.extractIntent(transcript);
    return {
      possibleIntent: intent.type,
      confidence: intent.confidence * 0.7, // Lower confidence for preview
      preview: true
    };
  }

  setLanguage(language) {
    this.language = language;
    // Would load language-specific patterns and entities
  }

  initializePatterns() {
    return {
      // Intent patterns initialized in extractIntent method
    };
  }

  initializeEntities() {
    return {
      symptoms: ['headache', 'cramps', 'bloating', 'nausea', 'fatigue'],
      emotions: ['happy', 'sad', 'anxious', 'irritable', 'energetic'],
      medications: ['ibuprofen', 'tylenol', 'aspirin', 'birth control']
    };
  }
}

class VoiceContextManager {
  constructor() {
    this.currentContext = 'general';
    this.contextHistory = [];
    this.contextRules = this.initializeContextRules();
  }

  setContext(context) {
    this.contextHistory.push({
      previous: this.currentContext,
      new: context,
      timestamp: Date.now()
    });
    
    this.currentContext = context;
  }

  getCurrentContext() {
    return this.currentContext;
  }

  getContextualExpectations() {
    const rules = this.contextRules[this.currentContext];
    return rules || this.contextRules.general;
  }

  initializeContextRules() {
    return {
      'symptom_logging': {
        expectedIntents: ['log_symptom'],
        commonEntities: ['symptoms', 'severity', 'time'],
        confidenceBoost: 0.1
      },
      'mood_tracking': {
        expectedIntents: ['log_mood'],
        commonEntities: ['emotions', 'energy', 'ratings'],
        confidenceBoost: 0.1
      },
      'medication_tracking': {
        expectedIntents: ['log_medication'],
        commonEntities: ['medications', 'dosage', 'time'],
        confidenceBoost: 0.1
      },
      'general': {
        expectedIntents: ['log_symptom', 'log_mood', 'log_medication', 'query_prediction'],
        commonEntities: ['symptoms', 'emotions', 'medications', 'time'],
        confidenceBoost: 0
      }
    };
  }
}

class VoiceCommandProcessor {
  constructor() {
    this.commandHistory = [];
    this.supportedCommands = this.initializeSupportedCommands();
    this.successCount = 0;
    this.totalCommands = 0;
  }

  interpret(nlpResult) {
    this.totalCommands++;
    
    const command = {
      id: this.generateCommandId(),
      timestamp: Date.now(),
      intent: nlpResult.intent,
      entities: nlpResult.entities,
      confidence: nlpResult.confidence,
      isValid: false,
      data: {},
      errors: []
    };
    
    // Validate and process the command based on intent
    switch (nlpResult.intent.type) {
      case 'log_symptom':
        this.processSymptomCommand(command, nlpResult);
        break;
      case 'log_mood':
        this.processMoodCommand(command, nlpResult);
        break;
      case 'log_medication':
        this.processMedicationCommand(command, nlpResult);
        break;
      case 'log_temperature':
        this.processTemperatureCommand(command, nlpResult);
        break;
      case 'query_prediction':
        this.processPredictionQuery(command, nlpResult);
        break;
      case 'set_reminder':
        this.processReminderCommand(command, nlpResult);
        break;
      default:
        command.errors.push('Unknown or unsupported intent');
    }
    
    if (command.isValid) {
      this.successCount++;
    }
    
    this.commandHistory.push(command);
    return command;
  }

  processSymptomCommand(command, nlpResult) {
    const entities = nlpResult.entities;
    
    if (entities.symptoms && entities.symptoms.length > 0) {
      command.data.symptoms = entities.symptoms;
      command.data.severity = this.extractSeverity(entities.numbers);
      command.data.notes = nlpResult.intent.extractedData;
      command.data.confidence = nlpResult.confidence;
      command.isValid = true;
      command.type = 'log_symptom';
    } else {
      command.errors.push('No symptoms identified in the input');
    }
  }

  processMoodCommand(command, nlpResult) {
    const entities = nlpResult.entities;
    const extractedData = nlpResult.intent.extractedData;
    
    command.data.overall = this.extractMoodRating(entities.numbers, extractedData);
    command.data.emotions = this.extractEmotions(extractedData);
    command.data.energy = this.extractEnergyLevel(entities.numbers, extractedData);
    command.data.notes = extractedData;
    command.data.confidence = nlpResult.confidence;
    
    if (command.data.overall || command.data.emotions.length > 0 || command.data.energy) {
      command.isValid = true;
      command.type = 'log_mood';
    } else {
      command.errors.push('Unable to extract mood information');
    }
  }

  processMedicationCommand(command, nlpResult) {
    const entities = nlpResult.entities;
    const extractedData = nlpResult.intent.extractedData;
    
    if (entities.medications && entities.medications.length > 0) {
      command.data.medication = entities.medications[0];
      command.data.taken = !this.containsMissedIndicator(extractedData);
      command.data.dosage = this.extractDosage(entities.numbers, extractedData);
      command.data.effectiveness = this.extractEffectiveness(entities.numbers);
      command.data.confidence = nlpResult.confidence;
      command.isValid = true;
      command.type = 'log_medication';
    } else {
      command.errors.push('No medication identified');
    }
  }

  extractSeverity(numbers) {
    if (numbers && numbers.length > 0) {
      const severity = Math.min(10, Math.max(1, Math.round(numbers[0])));
      return severity;
    }
    return 5; // Default moderate severity
  }

  extractMoodRating(numbers, text) {
    // Look for ratings out of 10
    if (numbers && numbers.length > 0) {
      return Math.min(10, Math.max(1, Math.round(numbers[0])));
    }
    
    // Look for descriptive terms
    if (text.includes('great') || text.includes('excellent')) return 9;
    if (text.includes('good') || text.includes('fine')) return 7;
    if (text.includes('okay') || text.includes('average')) return 5;
    if (text.includes('bad') || text.includes('poor')) return 3;
    if (text.includes('terrible') || text.includes('awful')) return 1;
    
    return null;
  }

  extractEmotions(text) {
    const emotionMap = {
      'happy': 8, 'joy': 9, 'excited': 8, 'calm': 6, 'peaceful': 7,
      'sad': 3, 'angry': 2, 'frustrated': 3, 'anxious': 3, 'worried': 4,
      'irritable': 2, 'stressed': 3, 'overwhelmed': 2, 'tired': 4,
      'energetic': 8, 'motivated': 8, 'confident': 8
    };
    
    const emotions = {};
    Object.entries(emotionMap).forEach(([emotion, intensity]) => {
      if (text.includes(emotion)) {
        emotions[emotion] = intensity;
      }
    });
    
    return emotions;
  }

  containsMissedIndicator(text) {
    const missedIndicators = ['missed', 'skipped', 'forgot', 'didn\'t take'];
    return missedIndicators.some(indicator => text.includes(indicator));
  }

  getSupportedCommands() {
    return Object.keys(this.supportedCommands);
  }

  getCommandHistory() {
    return this.commandHistory.slice(); // Return copy
  }

  getSuccessRate() {
    return this.totalCommands > 0 ? this.successCount / this.totalCommands : 0;
  }

  getMostUsedCommands() {
    const commandCounts = {};
    this.commandHistory.forEach(command => {
      if (command.isValid) {
        commandCounts[command.type] = (commandCounts[command.type] || 0) + 1;
      }
    });
    
    return Object.entries(commandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  generateCommandId() {
    return 'cmd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  initializeSupportedCommands() {
    return {
      'log_symptom': 'Log symptoms and their severity',
      'log_mood': 'Record mood and energy levels',
      'log_medication': 'Track medication intake and effectiveness',
      'log_temperature': 'Record body temperature readings',
      'log_flow': 'Track menstrual flow information',
      'query_prediction': 'Ask about cycle predictions',
      'set_reminder': 'Set medication or tracking reminders',
      'navigation': 'Navigate to different app sections'
    };
  }
}

class AudioFeedbackSystem {
  constructor() {
    this.audioContext = this.initializeAudioContext();
    this.sounds = this.initializeSounds();
    this.volume = 0.5;
    this.enabled = true;
  }

  initializeAudioContext() {
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio feedback not available:', error);
      return null;
    }
  }

  playStartSound() {
    if (this.enabled && this.audioContext) {
      this.playTone(800, 100); // High tone for start
    }
  }

  playStopSound() {
    if (this.enabled && this.audioContext) {
      this.playTone(400, 100); // Lower tone for stop
    }
  }

  playSuccessSound() {
    if (this.enabled && this.audioContext) {
      this.playTone(600, 50); // Success tone
      setTimeout(() => this.playTone(800, 50), 60);
    }
  }

  playErrorSound() {
    if (this.enabled && this.audioContext) {
      this.playTone(300, 200); // Error tone
    }
  }

  playTone(frequency, duration) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  initializeSounds() {
    return {
      start: { frequency: 800, duration: 100 },
      stop: { frequency: 400, duration: 100 },
      success: [{ frequency: 600, duration: 50 }, { frequency: 800, duration: 50, delay: 60 }],
      error: { frequency: 300, duration: 200 }
    };
  }
}

class VoicePrivacyManager {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
    this.privacySettings = {
      storeTranscripts: false,
      anonymizeData: true,
      localProcessing: true,
      retentionDays: 30
    };
  }

  startSecureSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      endTime: null,
      commandCount: 0,
      privacyFlags: [],
      anonymized: true
    };
    
    this.sessions.push(this.currentSession);
  }

  endSecureSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession = null;
    }
    
    this.cleanupOldSessions();
  }

  getAnonymizedSessions() {
    return this.sessions.map(session => ({
      id: this.hashSessionId(session.id),
      duration: session.endTime ? session.endTime - session.startTime : null,
      commandCount: session.commandCount,
      timestamp: Math.floor(session.startTime / (1000 * 60 * 60)) * (1000 * 60 * 60) // Hour precision only
    }));
  }

  getSessionCount() {
    return this.sessions.length;
  }

  cleanupOldSessions() {
    const cutoffTime = Date.now() - (this.privacySettings.retentionDays * 24 * 60 * 60 * 1000);
    this.sessions = this.sessions.filter(session => session.startTime > cutoffTime);
  }

  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  hashSessionId(sessionId) {
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

class NoiseFilter {
  constructor() {
    this.commonNoiseWords = [
      'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually'
    ];
  }

  filter(transcript) {
    let filtered = transcript;
    
    // Remove common noise words
    this.commonNoiseWords.forEach(noise => {
      const regex = new RegExp(`\\b${noise}\\b`, 'gi');
      filtered = filtered.replace(regex, '');
    });
    
    // Clean up extra whitespace
    filtered = filtered.replace(/\s+/g, ' ').trim();
    
    return filtered;
  }
}