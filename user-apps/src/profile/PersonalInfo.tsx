import { useRef, useState } from 'react';
import { Camera, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import type { ResidentProfile } from '@/lib/types';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

interface Props {
  profile: ResidentProfile;
  onUpdate: <K extends keyof ResidentProfile>(key: K, value: ResidentProfile[K]) => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function PersonalInfo({ profile, onUpdate }: Props) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_SIZE) { alert('Photo must be under 2 MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { onUpdate('avatar', reader.result as string); setUploading(false); };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('profile.personal_info')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {profile.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} /> : null}
            <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Camera className="h-4 w-4" /> {t('profile.change_photo')}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG · max 2 MB</p>
            {profile.verified && (
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <BadgeCheck className="h-4 w-4" /> {t('profile.verified')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.name')}</Label>
            <Input id="name" value={profile.name} onChange={e => onUpdate('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">{t('profile.ward')}</Label>
            <Input id="ward" value={profile.ward} onChange={e => onUpdate('ward', e.target.value)} placeholder={t('profile.ward_placeholder')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.phone')}</Label>
            <Input id="phone" value={profile.phone} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lga">{t('profile.lga')}</Label>
            <Input id="lga" value={profile.lga} onChange={e => onUpdate('lga', e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
