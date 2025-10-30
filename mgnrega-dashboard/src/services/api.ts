import { supabase } from '../lib/supabase';
import type { District, DistrictPerformance } from '../lib/supabase';

export async function getDistricts(stateCode?: string): Promise<District[]> {
  try {
    let query = supabase.from('districts').select('*');
    
    if (stateCode) {
      query = query.eq('state_code', stateCode);
    }
    
    const { data, error } = await query.order('district_name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

export async function getDistrictPerformance(
  districtCode: string
): Promise<DistrictPerformance[]> {
  try {
    const { data, error } = await supabase
      .from('district_performance')
      .select('*')
      .eq('district_code', districtCode)
      .order('fin_year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching performance:', error);
    return [];
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
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_3')) {
            return component.long_name;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
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
      
      (window as any).currentTTSAudio = audio;
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
  
  if ((window as any).currentTTSAudio) {
    (window as any).currentTTSAudio.pause();
    (window as any).currentTTSAudio.currentTime = 0;
    (window as any).currentTTSAudio = null;
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