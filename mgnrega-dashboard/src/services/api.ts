import { supabase } from '../lib/supabase';
import type { District, DistrictPerformance } from '../lib/supabase';

// Fetch all districts from Supabase
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

// Fetch performance data for a district
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

// Get latest performance for a district
export async function getLatestPerformance(
  districtCode: string
): Promise<DistrictPerformance | null> {
  try {
    const { data, error } = await supabase
      .from('district_performance')
      .select('*')
      .eq('district_code', districtCode)
      .order('fin_year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest performance:', error);
    return null;
  }
}

// Detect user location using browser geolocation
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

// Reverse geocode to get district from coordinates
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
      // Extract district from address components
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

// Text-to-Speech using browser's built-in API
export function speakText(text: string, lang: string = 'hi-IN'): void {
  try {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
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

// Stop any ongoing speech
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}