import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { usePlanim } from '@/context/PlanimContext';
import { forgetProfile } from '@/lib/badgeCloud';
import { syncMyName } from '@/lib/chat';
import { cloudConfigured, getUserId } from '@/lib/cloud';

const KEY = 'planim.nameSynced';

/** Görünmez: ad değişince sunucudaki profil ve sohbet üyelik kayıtlarını günceller (başarılı olursa aynı ad için bir daha denemez). */
export function NameSync() {
  const { settings } = usePlanim();
  const name = (settings.studentName ?? '').trim();
  const active = settings.signedIn && cloudConfigured() && !!name;
  useEffect(() => {
    if (!active) return undefined;
    let alive = true;
    const t = setTimeout(() => {
      (async () => {
        const uid = await getUserId();
        const sig = `${uid}|${name}`;
        if ((await AsyncStorage.getItem(KEY)) === sig) return;
        await syncMyName(name);
        forgetProfile(uid);
        if (alive) await AsyncStorage.setItem(KEY, sig);
      })().catch(() => undefined);
    }, 2000);
    return () => { alive = false; clearTimeout(t); };
  }, [active, name]);
  return null;
}
