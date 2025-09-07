// Wearable Device Integration System
// Seamless integration with fitness trackers and health devices for comprehensive cycle tracking

/**
 * Wearable Device Integration Manager
 * Supports Apple Watch, Fitbit, Garmin, Oura Ring, and other health devices
 */
export class WearableIntegrationManager {
  constructor() {
    this.supportedDevices = {
      apple_health: {
        name: 'Apple Health',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'steps', 'temperature', 'cycle_tracking'],
        api: 'HealthKit',
        permissions: ['HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN']
      },
      fitbit: {
        name: 'Fitbit',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'steps', 'temperature', 'stress'],
        api: 'Fitbit Web API',
        permissions: ['heartrate', 'sleep', 'temperature', 'activity']
      },
      garmin: {
        name: 'Garmin Connect',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'stress', 'recovery', 'temperature'],
        api: 'Garmin Connect IQ',
        permissions: ['wellness', 'activities', 'sleep']
      },
      oura: {
        name: 'Oura Ring',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'temperature', 'recovery', 'readiness'],
        api: 'Oura API v2',
        permissions: ['personal', 'daily', 'heartrate', 'sleep']
      },
      withings: {
        name: 'Withings',
        capabilities: ['heart_rate', 'sleep', 'temperature', 'weight', 'blood_pressure'],
        api: 'Withings API',
        permissions: ['user.metrics', 'user.activity']
      },
      google_fit: {
        name: 'Google Fit',
        capabilities: ['heart_rate', 'sleep', 'steps', 'weight'],
        api: 'Google Fit API',
        permissions: ['fitness.heart_rate.read', 'fitness.sleep.read']
      }
    };

    // Connection status tracking
    this.connections = new Map();
    
    // Data processing intervals
    this.syncIntervals = new Map();
    
    // Event listeners for real-time updates
    this.eventListeners = new Map();
  }

  /**
   * Initialize wearable connections
   */
  async initializeConnections() {
    const availableDevices = await this.detectAvailableDevices();
    const connectionPromises = availableDevices.map(device => this.connectDevice(device));
    
    try {
      const results = await Promise.allSettled(connectionPromises);
      return {
        success: true,
        connected_devices: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed_connections: results.filter(r => r.status === 'rejected').map(r => r.reason)
      };
    } catch (error) {
      console.error('Failed to initialize wearable connections:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect available wearable devices
   */
  async detectAvailableDevices() {
    const availableDevices = [];

    // Check for Apple Health (iOS)
    if (typeof DeviceMotionEvent !== 'undefined' && window.DeviceMotionEvent) {
      if (await this.checkAppleHealthAvailability()) {
        availableDevices.push('apple_health');
      }
    }

    // Check for Web Bluetooth support (for devices like Oura, some Fitbit models)
    if ('bluetooth' in navigator) {
      availableDevices.push('bluetooth_devices');
    }

    // Check for installed apps/SDKs
    const webBasedDevices = ['fitbit', 'garmin', 'withings', 'google_fit'];
    for (const device of webBasedDevices) {
      if (await this.checkDeviceAvailability(device)) {
        availableDevices.push(device);
      }
    }

    return availableDevices;
  }

  /**
   * Connect to a specific device
   */
  async connectDevice(deviceType) {
    try {
      const device = this.supportedDevices[deviceType];
      if (!device) {
        throw new Error(`Unsupported device type: ${deviceType}`);
      }

      let connection;
      switch (deviceType) {
        case 'apple_health':
          connection = await this.connectAppleHealth();
          break;
        case 'fitbit':
          connection = await this.connectFitbit();
          break;
        case 'garmin':
          connection = await this.connectGarmin();
          break;
        case 'oura':
          connection = await this.connectOura();
          break;
        case 'withings':
          connection = await this.connectWithings();
          break;
        case 'google_fit':
          connection = await this.connectGoogleFit();
          break;
        default:
          throw new Error(`Connection method not implemented for ${deviceType}`);
      }

      this.connections.set(deviceType, {
        ...connection,
        device: device,
        connected_at: new Date().toISOString(),
        status: 'connected'
      });

      // Start data synchronization
      await this.startDataSync(deviceType);

      return { device: deviceType, status: 'connected', capabilities: device.capabilities };
    } catch (error) {
      console.error(`Failed to connect to ${deviceType}:`, error);
      return { device: deviceType, status: 'failed', error: error.message };
    }
  }

  /**
   * Apple Health integration
   */
  async connectAppleHealth() {
    // Apple Health integration requires native iOS app or Progressive Web App
    if (!window.webkit?.messageHandlers?.healthKit) {
      throw new Error('Apple Health integration requires native app context');
    }

    const permissions = this.supportedDevices.apple_health.permissions;
    
    return new Promise((resolve, reject) => {
      window.webkit.messageHandlers.healthKit.postMessage({
        type: 'requestPermissions',
        permissions: permissions
      });

      // Listen for response
      window.addEventListener('healthKitResponse', (event) => {
        if (event.detail.success) {
          resolve({
            api_type: 'native',
            permissions_granted: event.detail.permissions,
            device_info: event.detail.deviceInfo
          });
        } else {
          reject(new Error(event.detail.error));
        }
      }, { once: true });
    });
  }

  /**
   * Fitbit integration
   */
  async connectFitbit() {
    const clientId = process.env.VITE_FITBIT_CLIENT_ID;
    if (!clientId) {
      throw new Error('Fitbit client ID not configured');
    }

    const scopes = ['heartrate', 'sleep', 'temperature', 'activity'].join(' ');
    const redirectUri = `${window.location.origin}/integrations/fitbit/callback`;
    
    const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&expires_in=604800`;

    // Open OAuth flow in popup
    const popup = window.open(authUrl, 'fitbit_auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'fitbit_auth_success') {
          clearInterval(checkClosed);
          popup.close();
          
          try {
            const tokenData = await this.exchangeFitbitCode(event.data.code);
            resolve({
              api_type: 'oauth',
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_at: Date.now() + (tokenData.expires_in * 1000),
              user_id: tokenData.user_id
            });
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'fitbit_auth_error') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  /**
   * Oura Ring integration
   */
  async connectOura() {
    const clientId = process.env.VITE_OURA_CLIENT_ID;
    if (!clientId) {
      throw new Error('Oura client ID not configured');
    }

    const scopes = ['personal', 'daily', 'heartrate', 'sleep'].join(' ');
    const redirectUri = `${window.location.origin}/integrations/oura/callback`;
    
    const authUrl = `https://cloud.ouraring.com/oauth/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}`;

    const popup = window.open(authUrl, 'oura_auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oura_auth_success') {
          clearInterval(checkClosed);
          popup.close();
          
          try {
            const tokenData = await this.exchangeOuraCode(event.data.code);
            resolve({
              api_type: 'oauth',
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_at: Date.now() + (tokenData.expires_in * 1000)
            });
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  /**
   * Start continuous data synchronization
   */
  async startDataSync(deviceType) {
    const connection = this.connections.get(deviceType);
    if (!connection) return;

    // Sync immediately
    await this.syncDeviceData(deviceType);

    // Set up periodic sync (every 15 minutes)
    const syncInterval = setInterval(async () => {
      try {
        await this.syncDeviceData(deviceType);
      } catch (error) {
        console.error(`Data sync failed for ${deviceType}:`, error);
        
        // If token expired, try to refresh
        if (error.message.includes('token') || error.message.includes('401')) {
          await this.refreshDeviceToken(deviceType);
        }
      }
    }, 15 * 60 * 1000);

    this.syncIntervals.set(deviceType, syncInterval);
  }

  /**
   * Sync data from connected device
   */
  async syncDeviceData(deviceType) {
    const connection = this.connections.get(deviceType);
    if (!connection || connection.status !== 'connected') return;

    const syncResults = {};
    const device = this.supportedDevices[deviceType];

    try {
      // Sync heart rate data
      if (device.capabilities.includes('heart_rate')) {
        syncResults.heart_rate = await this.syncHeartRateData(deviceType, connection);
      }

      // Sync HRV data
      if (device.capabilities.includes('hrv')) {
        syncResults.hrv = await this.syncHRVData(deviceType, connection);
      }

      // Sync sleep data
      if (device.capabilities.includes('sleep')) {
        syncResults.sleep = await this.syncSleepData(deviceType, connection);
      }

      // Sync temperature data
      if (device.capabilities.includes('temperature')) {
        syncResults.temperature = await this.syncTemperatureData(deviceType, connection);
      }

      // Sync stress/recovery data
      if (device.capabilities.includes('stress')) {
        syncResults.stress = await this.syncStressData(deviceType, connection);
      }

      // Update last sync time
      connection.last_sync = new Date().toISOString();
      
      return syncResults;
    } catch (error) {
      console.error(`Data sync failed for ${deviceType}:`, error);
      throw error;
    }
  }

  /**
   * Sync heart rate data
   */
  async syncHeartRateData(deviceType, connection) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    let heartRateData = [];

    switch (deviceType) {
      case 'fitbit':
        heartRateData = await this.fetchFitbitHeartRate(connection, startDate, endDate);
        break;
      case 'oura':
        heartRateData = await this.fetchOuraHeartRate(connection, startDate, endDate);
        break;
      case 'apple_health':
        heartRateData = await this.fetchAppleHealthHeartRate(connection, startDate, endDate);
        break;
      default:
        console.warn(`Heart rate sync not implemented for ${deviceType}`);
    }

    return this.processHeartRateData(heartRateData);
  }

  /**
   * Sync Heart Rate Variability data
   */
  async syncHRVData(deviceType, connection) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    let hrvData = [];

    switch (deviceType) {
      case 'oura':
        hrvData = await this.fetchOuraHRV(connection, startDate, endDate);
        break;
      case 'apple_health':
        hrvData = await this.fetchAppleHealthHRV(connection, startDate, endDate);
        break;
      case 'garmin':
        hrvData = await this.fetchGarminHRV(connection, startDate, endDate);
        break;
      default:
        console.warn(`HRV sync not implemented for ${deviceType}`);
    }

    return this.processHRVData(hrvData);
  }

  /**
   * Sync sleep data
   */
  async syncSleepData(deviceType, connection) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    let sleepData = [];

    switch (deviceType) {
      case 'fitbit':
        sleepData = await this.fetchFitbitSleep(connection, startDate, endDate);
        break;
      case 'oura':
        sleepData = await this.fetchOuraSleep(connection, startDate, endDate);
        break;
      case 'apple_health':
        sleepData = await this.fetchAppleHealthSleep(connection, startDate, endDate);
        break;
      default:
        console.warn(`Sleep sync not implemented for ${deviceType}`);
    }

    return this.processSleepData(sleepData);
  }

  /**
   * Process and normalize heart rate data
   */
  processHeartRateData(rawData) {
    return rawData.map(dataPoint => ({
      timestamp: new Date(dataPoint.timestamp).toISOString(),
      heart_rate: dataPoint.value,
      data_source: dataPoint.source || 'wearable',
      quality: this.assessHeartRateQuality(dataPoint.value),
      cycle_correlation: this.calculateCycleCorrelation('heart_rate', dataPoint.value, dataPoint.timestamp)
    })).filter(dp => dp.quality !== 'invalid');
  }

  /**
   * Process and normalize HRV data
   */
  processHRVData(rawData) {
    return rawData.map(dataPoint => ({
      timestamp: new Date(dataPoint.timestamp).toISOString(),
      hrv_rmssd: dataPoint.rmssd,
      hrv_sdnn: dataPoint.sdnn,
      data_source: dataPoint.source || 'wearable',
      quality: this.assessHRVQuality(dataPoint),
      cycle_correlation: this.calculateCycleCorrelation('hrv', dataPoint.rmssd, dataPoint.timestamp)
    })).filter(dp => dp.quality !== 'invalid');
  }

  /**
   * Process and normalize sleep data
   */
  processSleepData(rawData) {
    return rawData.map(dataPoint => ({
      date: new Date(dataPoint.date).toISOString().split('T')[0],
      total_sleep_minutes: dataPoint.total_sleep_minutes,
      deep_sleep_minutes: dataPoint.deep_sleep_minutes || 0,
      rem_sleep_minutes: dataPoint.rem_sleep_minutes || 0,
      light_sleep_minutes: dataPoint.light_sleep_minutes || 0,
      sleep_efficiency: dataPoint.efficiency || 0,
      sleep_score: dataPoint.score || null,
      bedtime: dataPoint.bedtime,
      wake_time: dataPoint.wake_time,
      data_source: dataPoint.source || 'wearable',
      quality: this.assessSleepQuality(dataPoint),
      cycle_correlation: this.calculateCycleCorrelation('sleep', dataPoint.total_sleep_minutes, dataPoint.date)
    })).filter(dp => dp.quality !== 'invalid');
  }

  /**
   * Calculate correlation between wearable data and cycle phase
   */
  calculateCycleCorrelation(dataType, value, timestamp) {
    // This would integrate with the cycle tracking data
    // Placeholder for cycle correlation calculation
    const cycleDay = this.estimateCycleDay(timestamp);
    const cyclePhase = this.getCyclePhase(cycleDay);
    
    return {
      cycle_day: cycleDay,
      cycle_phase: cyclePhase,
      correlation_strength: this.calculateDataCorrelation(dataType, value, cyclePhase)
    };
  }

  /**
   * Assess data quality
   */
  assessHeartRateQuality(heartRate) {
    if (heartRate < 40 || heartRate > 200) return 'invalid';
    if (heartRate < 50 || heartRate > 180) return 'questionable';
    return 'good';
  }

  assessHRVQuality(hrvData) {
    const rmssd = hrvData.rmssd;
    if (!rmssd || rmssd < 5 || rmssd > 200) return 'invalid';
    if (rmssd < 10 || rmssd > 150) return 'questionable';
    return 'good';
  }

  assessSleepQuality(sleepData) {
    const totalSleep = sleepData.total_sleep_minutes;
    if (!totalSleep || totalSleep < 60 || totalSleep > 720) return 'invalid';
    if (totalSleep < 240 || totalSleep > 600) return 'questionable';
    return 'good';
  }

  /**
   * Device-specific data fetching methods
   */
  async fetchFitbitHeartRate(connection, startDate, endDate) {
    const dateStr = startDate.toISOString().split('T')[0];
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${dateStr}/1d/1min.json`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Fitbit API error: ${response.status}`);
    }

    const data = await response.json();
    return data['activities-heart-intraday']?.dataset?.map(dp => ({
      timestamp: `${dateStr}T${dp.time}`,
      value: dp.value,
      source: 'fitbit'
    })) || [];
  }

  async fetchOuraHeartRate(connection, startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.ouraring.com/v2/usercollection/heartrate?start_date=${startDateStr}&end_date=${endDateStr}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.map(dp => ({
      timestamp: dp.timestamp,
      value: dp.bpm,
      source: 'oura'
    })) || [];
  }

  async fetchOuraHRV(connection, startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDateStr}&end_date=${endDateStr}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.map(dp => ({
      timestamp: dp.day,
      rmssd: dp.contributors?.hrv_balance?.rmssd,
      source: 'oura'
    })) || [];
  }

  async fetchOuraSleep(connection, startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDateStr}&end_date=${endDateStr}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.map(dp => ({
      date: dp.day,
      total_sleep_minutes: dp.contributors?.total_sleep,
      deep_sleep_minutes: dp.contributors?.deep_sleep,
      rem_sleep_minutes: dp.contributors?.rem_sleep,
      efficiency: dp.contributors?.efficiency,
      score: dp.score,
      bedtime: dp.bedtime_start,
      wake_time: dp.bedtime_end,
      source: 'oura'
    })) || [];
  }

  /**
   * Token refresh methods
   */
  async refreshDeviceToken(deviceType) {
    const connection = this.connections.get(deviceType);
    if (!connection || !connection.refresh_token) return;

    try {
      let newTokenData;
      switch (deviceType) {
        case 'fitbit':
          newTokenData = await this.refreshFitbitToken(connection.refresh_token);
          break;
        case 'oura':
          newTokenData = await this.refreshOuraToken(connection.refresh_token);
          break;
        default:
          throw new Error(`Token refresh not implemented for ${deviceType}`);
      }

      // Update connection with new tokens
      connection.access_token = newTokenData.access_token;
      connection.refresh_token = newTokenData.refresh_token;
      connection.expires_at = Date.now() + (newTokenData.expires_in * 1000);
      
      this.connections.set(deviceType, connection);
    } catch (error) {
      console.error(`Token refresh failed for ${deviceType}:`, error);
      // Mark connection as expired
      connection.status = 'token_expired';
      this.connections.set(deviceType, connection);
    }
  }

  /**
   * Get integrated health insights
   */
  generateHealthInsights(cycleData, symptomsData) {
    const insights = [];
    const connectedDevices = Array.from(this.connections.keys());

    if (connectedDevices.length === 0) {
      return [{
        type: 'integration_opportunity',
        message: 'Connect a wearable device for deeper health insights',
        priority: 'medium'
      }];
    }

    // Analyze heart rate patterns
    const hrInsights = this.analyzeHeartRatePatterns(cycleData);
    insights.push(...hrInsights);

    // Analyze HRV patterns
    const hrvInsights = this.analyzeHRVPatterns(cycleData);
    insights.push(...hrvInsights);

    // Analyze sleep patterns
    const sleepInsights = this.analyzeSleepPatterns(cycleData, symptomsData);
    insights.push(...sleepInsights);

    return insights;
  }

  /**
   * Analyze heart rate patterns across cycle
   */
  analyzeHeartRatePatterns(cycleData) {
    const insights = [];
    // Implementation would analyze heart rate variability across cycle phases
    // and identify patterns correlating with hormonal changes
    
    insights.push({
      type: 'heart_rate_pattern',
      message: 'Heart rate typically increases during luteal phase',
      confidence: 'medium',
      data_source: 'wearable'
    });

    return insights;
  }

  /**
   * Analyze HRV patterns
   */
  analyzeHRVPatterns(cycleData) {
    const insights = [];
    // Implementation would analyze HRV changes across cycle phases
    // Lower HRV often correlates with premenstrual phase
    
    insights.push({
      type: 'hrv_pattern',
      message: 'HRV decreases in the week before menstruation',
      confidence: 'high',
      data_source: 'wearable'
    });

    return insights;
  }

  /**
   * Analyze sleep patterns
   */
  analyzeSleepPatterns(cycleData, symptomsData) {
    const insights = [];
    // Implementation would correlate sleep quality with cycle phases
    // and symptoms like insomnia or fatigue
    
    insights.push({
      type: 'sleep_pattern',
      message: 'Sleep efficiency decreases during premenstrual phase',
      confidence: 'medium',
      data_source: 'wearable'
    });

    return insights;
  }

  /**
   * Disconnect a device
   */
  async disconnectDevice(deviceType) {
    const connection = this.connections.get(deviceType);
    if (!connection) return;

    // Clear sync interval
    const syncInterval = this.syncIntervals.get(deviceType);
    if (syncInterval) {
      clearInterval(syncInterval);
      this.syncIntervals.delete(deviceType);
    }

    // Revoke tokens if applicable
    try {
      switch (deviceType) {
        case 'fitbit':
          await this.revokeFitbitToken(connection.access_token);
          break;
        case 'oura':
          await this.revokeOuraToken(connection.access_token);
          break;
      }
    } catch (error) {
      console.warn(`Token revocation failed for ${deviceType}:`, error);
    }

    // Remove connection
    this.connections.delete(deviceType);
    
    return { success: true, device: deviceType, status: 'disconnected' };
  }

  /**
   * Get connection status for all devices
   */
  getConnectionStatus() {
    const status = {};
    
    Object.keys(this.supportedDevices).forEach(deviceType => {
      const connection = this.connections.get(deviceType);
      status[deviceType] = {
        supported: true,
        connected: !!connection && connection.status === 'connected',
        last_sync: connection?.last_sync || null,
        capabilities: this.supportedDevices[deviceType].capabilities,
        status: connection?.status || 'not_connected'
      };
    });

    return status;
  }

  /**
   * Export wearable data for analysis
   */
  exportWearableData(dateRange) {
    const exportData = {};
    
    this.connections.forEach((connection, deviceType) => {
      exportData[deviceType] = {
        device_info: this.supportedDevices[deviceType],
        connection_info: {
          connected_at: connection.connected_at,
          last_sync: connection.last_sync,
          status: connection.status
        },
        // Data would be fetched based on date range
        data_summary: 'Available upon request'
      };
    });

    return {
      export_date: new Date().toISOString(),
      date_range: dateRange,
      connected_devices: exportData,
      data_types: ['heart_rate', 'hrv', 'sleep', 'temperature', 'stress']
    };
  }

  // Helper methods
  async checkAppleHealthAvailability() {
    return window.webkit?.messageHandlers?.healthKit !== undefined;
  }

  async checkDeviceAvailability(deviceType) {
    // This would check for device-specific availability
    // For web-based integrations, this might check for stored tokens
    return localStorage.getItem(`${deviceType}_token`) !== null;
  }

  async exchangeFitbitCode(code) {
    // Implementation would exchange authorization code for access token
    // This requires backend service to handle client secret
    throw new Error('Token exchange requires backend implementation');
  }

  async exchangeOuraCode(code) {
    // Implementation would exchange authorization code for access token
    throw new Error('Token exchange requires backend implementation');
  }

  estimateCycleDay(timestamp) {
    // This would integrate with cycle tracking to determine current cycle day
    return 15; // Placeholder
  }

  getCyclePhase(cycleDay) {
    if (cycleDay <= 7) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 16) return 'ovulatory';
    return 'luteal';
  }

  calculateDataCorrelation(dataType, value, cyclePhase) {
    // Implementation would calculate correlation between wearable data and cycle phase
    return Math.random() * 0.5 + 0.3; // Placeholder correlation score
  }
}

/**
 * Factory function for creating wearable integration manager
 */
export function createWearableIntegration() {
  return new WearableIntegrationManager();
}

/**
 * Initialize wearable integrations
 */
export async function initializeWearables() {
  const manager = new WearableIntegrationManager();
  return await manager.initializeConnections();
}