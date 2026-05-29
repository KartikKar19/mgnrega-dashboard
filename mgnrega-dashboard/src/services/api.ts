import { supabase } from '../lib/supabase';
import type { District, DistrictPerformance } from '../lib/supabase';
import { FALLBACK_DISTRICTS, getFallbackPerformance } from './fallbackData';

interface CustomWindow extends Window {
  currentTTSAudio?: HTMLAudioElement | null;
}

export async function getDistrictFromIP(): Promise<string | null> {
  console.log('[API] Attempting IP Geolocation...');

  // 1. Try ipapi.co first (highly reliable, HTTPS-friendly, CORS-friendly)
  try {
    console.log('[API] Trying ipapi.co...');
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      console.log('[API] ipapi.co response:', data);
      const result = data.city || data.region || null;
      console.log('[API] Resolved location from ipapi.co:', result);
      return result;
    }
  } catch (error) {
    console.warn('[API] ipapi.co failed, trying ipinfo.io...', error);
  }

  // 2. Try ipinfo.io as secondary fallback
  try {
    console.log('[API] Trying ipinfo.io...');
    const response = await fetch('https://ipinfo.io/json');
    if (response.ok) {
      const data = await response.json();
      console.log('[API] ipinfo.io response:', data);
      const result = data.city || data.region || null;
      console.log('[API] Resolved location from ipinfo.io:', result);
      return result;
    }
  } catch (error) {
    console.warn('[API] ipinfo.io failed, trying freeipapi.com...', error);
  }

  // 3. Try freeipapi.com as tertiary fallback
  try {
    console.log('[API] Trying freeipapi.com...');
    const response = await fetch('https://freeipapi.com/api/json');
    if (response.ok) {
      const data = await response.json();
      console.log('[API] freeipapi.com response:', data);
      if (data && data.cityName) {
        console.log('[API] Resolved city from freeipapi.com:', data.cityName);
        return data.cityName;
      }
    }
  } catch (error) {
    console.warn('[API] freeipapi.com failed, trying ip-api.com...', error);
  }

  // 4. Try ip-api.com (Note: HTTPS fetches to their free tier fail on modern browsers, so last resort)
  try {
    console.log('[API] Trying ip-api.com...');
    const response = await fetch('https://ip-api.com/json/');
    if (response.ok) {
      const data = await response.json();
      console.log('[API] ip-api.com response:', data);
      if (data && data.status === 'success') {
        const result = data.city || data.regionName || null;
        console.log('[API] Resolved location from ip-api.com:', result);
        return result;
      }
    }
  } catch (error) {
    console.warn('[API] ip-api.com failed', error);
  }

  console.log('[API] IP Geolocation failed entirely.');
  return null;
}

export async function getDistricts(): Promise<District[]> {
  try {
    // 1. Try district_names table first (the correct metadata table in this database schema)
    const { data: namesData, error: namesError } = await supabase
      .from('district_names')
      .select('district_name_en,district_name_hi')
      .order('district_name_en');

    if (!namesError && namesData && namesData.length > 0) {
      return namesData;
    }

    // 2. Try districts table as secondary fallback
    const { data: districtsData, error: districtsError } = await supabase
      .from('districts')
      .select('district_name_en,district_name_hi')
      .order('district_name_en');

    if (!districtsError && districtsData && districtsData.length > 0) {
      return districtsData;
    }

    // 3. Query district_performance directly as tertiary fallback
    const { data: performanceData, error: performanceError } = await supabase
      .from('district_performance')
      .select('district_name_en,district_name_hi')
      .order('district_name_en');

    if (!performanceError && performanceData && performanceData.length > 0) {
      // Deduplicate in memory
      const uniqueMap = new Map<string, District>();
      for (const row of performanceData) {
        if (row.district_name_en) {
          const key = row.district_name_en.toLowerCase().trim();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              district_name_en: row.district_name_en,
              district_name_hi: row.district_name_hi || row.district_name_en,
            });
          }
        }
      }
      const result = Array.from(uniqueMap.values());
      if (result.length > 0) {
        result.sort((a, b) => a.district_name_en.localeCompare(b.district_name_en));
        return result;
      }
    }

    // 4. If database is empty, return local fallback data
    return FALLBACK_DISTRICTS;
  } catch (error) {
    console.error('Error fetching districts, using local fallback data:', error);
    return FALLBACK_DISTRICTS;
  }
}

export async function getDistrictPerformance(
  districtNameEn: string
): Promise<DistrictPerformance[]> {
  try {
    const { data, error } = await supabase
      .from('district_performance')
      .select('*')
      .eq('district_name_en', districtNameEn)
      .order('reporting_month', { ascending: false });
    
    if (error) throw error;
    if (data && data.length > 0) {
      return data;
    }
    
    // If empty result, check fallback data
    return getFallbackPerformance(districtNameEn);
  } catch (error) {
    console.error('Error fetching performance, using local fallback data:', error);
    return getFallbackPerformance(districtNameEn);
  }
}

export async function detectUserLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
}
export async function getDistrictFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  console.log(`[API] Reverse geocoding coordinates: Lat=${lat}, Lng=${lng}`);
  
  // 1. Try Google Maps Geocoding first (if key is present)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      console.log('[API] Trying Google Geocoding API...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      console.log('[API] Google Geocoding API response status:', data.status);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
          // Find administrative_area_level_2 first
          for (const result of data.results) {
            for (const component of result.address_components) {
              if (component.types.includes('administrative_area_level_2')) {
                console.log('[API] Found administrative_area_level_2 (District):', component.long_name);
                return component.long_name;
              }
            }
          }
          
          // Fallback to other components
          const fallbackTypes = ['locality', 'administrative_area_level_3', 'administrative_area_level_1'];
          for (const result of data.results) {
            for (const component of result.address_components) {
              if (component.types.some((type: string) => fallbackTypes.includes(type))) {
                console.log('[API] Found Google fallback address component:', component.long_name);
                return component.long_name;
              }
            }
          }
      } else {
        console.warn('[API] Google Geocoding failed or returned non-OK status:', data.status);
      }
    } catch (error) {
      console.warn('[API] Google reverse geocoding request failed:', error);
    }
  } else {
    console.log('[API] Google Maps API key missing, skipping Google Geocoding...');
  }

  // 2. Try OpenStreetMap Nominatim API as a fallback geocoding service (free, keyless, CORS-friendly)
  try {
    console.log('[API] Trying OpenStreetMap Nominatim Reverse Geocoding...');
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'mgnrega-dashboard-app' // User-Agent identifying our requests as per OSM policies
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('[API] Nominatim response:', data);
      if (data && data.address) {
        const district = data.address.state_district || data.address.county || data.address.city || data.address.town || null;
        if (district) {
          console.log('[API] Resolved location from Nominatim:', district);
          return district;
        }
      }
    } else {
      console.warn('[API] Nominatim request failed with status:', response.status);
    }
  } catch (osmErr) {
    console.warn('[API] OpenStreetMap Nominatim geocoding failed:', osmErr);
  }

  // 3. Fallback to IP lookup if geocoding returns no results
  console.log('[API] Reverse geocoding did not resolve. Falling back to IP Geolocation...');
  return await getDistrictFromIP();
}

const getVoiceName = (lang: string): string => {
  switch (lang) {
      case 'pa-IN':
          return 'pa-IN-Wavenet-A';
      case 'bn-IN':
          return 'bn-IN-Wavenet-D';
      case 'ta-IN':
          return 'ta-IN-Wavenet-D';
      case 'te-IN':
          return 'te-IN-Wavenet-D';
      case 'gu-IN':
          return 'gu-IN-Wavenet-A';
      case 'mr-IN':
          return 'mr-IN-Wavenet-A';
      case 'kn-IN':
          return 'kn-IN-Wavenet-A';
      case 'en-IN':
          return 'en-IN-Wavenet-D';
      case 'hi-IN':
      default:
          return 'hi-IN-Wavenet-D';
  }
};

export async function speakWithGoogleTTS(text: string, lang: string = 'hi-IN'): Promise<void> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google TTS API key not found, falling back to browser TTS');
      speakText(text, lang);
      return;
    }

    const voiceName = getVoiceName(lang);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: lang,
            name: voiceName,
            ssmlGender: 'NEUTRAL'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.9
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
      
      (window as unknown as CustomWindow).currentTTSAudio = audio;
    } else {
      throw new Error('No audio content received');
    }
  } catch (error) {
    console.error('Error with Google TTS:', error);
    speakText(text, lang);
  }
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  const customWindow = window as unknown as CustomWindow;
  if (customWindow.currentTTSAudio) {
    customWindow.currentTTSAudio.pause();
    customWindow.currentTTSAudio.currentTime = 0;
    customWindow.currentTTSAudio = null;
  }
}

export function speakText(text: string, lang: string = 'hi-IN'): void {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('Error with text-to-speech:', error);
  }
}