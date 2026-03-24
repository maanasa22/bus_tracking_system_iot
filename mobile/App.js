import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';

// The Public Serveo Shell URL for robust 4G ISP testing without AuthTokens
const SERVER_URL = 'https://9cead0c254da0af3-106-196-18-47.serveousercontent.com';

export default function App() {
  const [busId, setBusId] = useState('BUS-001');
  const [isConnected, setIsConnected] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  
  const socketRef = useRef(null);
  const locationSubRef = useRef(null);

  useEffect(() => {
    // Initial Socket connection handler
    socketRef.current = io(SERVER_URL, {
      path: '/api/socket/io',
      transports: ['websocket'],
      autoConnect: false, // Wait until driver presses start
      extraHeaders: {
        "Bypass-Tunnel-Reminder": "true" // Required to bypass LocalTunnel's warning page
      }
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));
    socketRef.current.on('connect_error', (err) => {
      console.log('Socket Error:', err);
      Alert.alert('Connection Failed', `Could not connect to ${SERVER_URL} Server.`);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationSubRef.current) locationSubRef.current.remove();
    };
  }, []);

  const toggleTracking = async () => {
    if (isTracking) {
      stopTracking();
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'GPS is required to track the bus.');
      return;
    }

    try {
      socketRef.current.connect();
      
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
          if (socketRef.current?.connected) {
            socketRef.current.emit('driver:locationUpdate', {
              busId,
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              speed: loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : Math.floor(Math.random() * 40 + 20),
              heading: loc.coords.heading || 0,
              timestamp: loc.timestamp,
            });
          }
        }
      );
      
      locationSubRef.current = sub;
      setIsTracking(true);
    } catch (e) {
      Alert.alert('Tracking Error', e.message);
    }
  };

  const stopTracking = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsTracking(false);
    setIsConnected(false);
    setLocation(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TracyG Driver Gateway</Text>
        <Text style={styles.subtitle}>Mobile Telemetry Sync</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ASSIGNED BUS ID</Text>
        <TextInput 
          style={styles.input}
          value={busId}
          onChangeText={setBusId}
          placeholder="e.g. BUS-001"
          placeholderTextColor="#64748b"
          editable={!isTracking}
        />

        <TouchableOpacity 
          style={[styles.button, isTracking ? styles.buttonStop : styles.buttonStart]} 
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'STOP TRANSMITTING' : 'START LIVE SYNC'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>NETWORK STATUS</Text>
        <View style={styles.statusRow}>
          <View style={[styles.indicator, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isConnected ? 'Connected to Backbone' : 'Offline'}</Text>
        </View>

        <Text style={[styles.statusLabel, { marginTop: 20 }]}>GPS TELEMETRY</Text>
        <View style={styles.statusRow}>
          <View style={[styles.indicator, { backgroundColor: isTracking ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isTracking ? 'Hardware Sensor Active' : 'Sensor Asleep'}</Text>
        </View>

        {location && isTracking && (
          <View style={styles.gpsData}>
             <Text style={styles.gpsText}>LAT: {location.coords.latitude.toFixed(6)}</Text>
             <Text style={styles.gpsText}>LNG: {location.coords.longitude.toFixed(6)}</Text>
             <Text style={styles.gpsText}>SPD: {location.coords.speed ? (location.coords.speed * 3.6).toFixed(1) : 0} km/h</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050812',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#050812',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonStart: {
    backgroundColor: '#4f46e5',
  },
  buttonStop: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  statusBox: {
    marginTop: 30,
    backgroundColor: '#0a0e1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  gpsData: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  gpsText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  }
});
