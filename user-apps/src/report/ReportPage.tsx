import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertTriangle, Flame, Heart, UserX, HelpCircle, Camera, Video, Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { api } from '@/lib/api';
import type { ResidentAlertType } from '@/lib/types';
import ReportConfirmation from './ReportConfirmation';

const REPORT_TYPES: { id: ResidentAlertType; icon: React.ElementType; tKey: string; color: string }[] = [
  { id: 'attack',    icon: AlertTriangle, tKey: 'report.type_attack',    color: 'bg-red-600 hover:bg-red-700 text-white' },
  { id: 'fire',      icon: Flame,         tKey: 'report.type_fire',      color: 'bg-orange-600 hover:bg-orange-700 text-white' },
  { id: 'medical',   icon: Heart,         tKey: 'report.type_medical',   color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { id: 'abduction', icon: UserX,         tKey: 'report.type_abduction', color: 'bg-amber-700 hover:bg-amber-800 text-white' },
  { id: 'other',     icon: HelpCircle,    tKey: 'report.type_other',     color: 'bg-gray-600 hover:bg-gray-700 text-white' },
];

export default function ReportPage() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { submitReport } = useReports();
  const [selectedType, setSelectedType] = useState<ResidentAlertType | null>(null);
  const [lga, setLga] = useState(session?.lga ?? '');
  const [lgas, setLgas] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get<{ data: { id: string; name: string }[] }>('/lgas')
      .then(res => setLgas((res.data || []).map(l => l.name)))
      .catch(() => setLgas(['Otukpo', 'Agatu', 'Apa', 'Ado', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu']));
  }, []);

  // Camera state
  const [mediaMode, setMediaMode] = useState<'photo' | 'video' | 'live' | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopMedia = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setMediaMode(null);
    setIsRecording(false);
    setMediaError(null);
  }, [stream]);

  const startCamera = useCallback(async (mode: 'photo' | 'video' | 'live') => {
    setMediaError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      setMediaMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      if (mode === 'live') {
        setIsRecording(true);
      }
    } catch {
      setMediaError(t('report.camera_error'));
    }
  }, [t]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !stream) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedMedia(dataUrl);
    stopMedia();
  }, [stream, stopMedia]);

  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia(url);
      stopMedia();
    };
    recorder.start();
    setIsRecording(true);
  }, [stream, stopMedia]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleSubmit = () => {
    if (!selectedType || !lga) return;
    submitReport(selectedType, lga, description.trim());
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedType(null);
    setDescription('');
    setLga(session?.lga ?? '');
    setCapturedMedia(null);
    stopMedia();
    setSubmitted(false);
  };

  if (submitted) return <ReportConfirmation onReportAnother={handleReset} />;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('report.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('report.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('report.incident_type') || 'What type of incident?'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {REPORT_TYPES.map(rt => {
              const Icon = rt.icon;
              return (
                <Button
                  key={rt.id}
                  className={`h-auto py-4 flex flex-col items-center gap-1.5 ${rt.color} ${
                    selectedType === rt.id ? 'ring-2 ring-white/50' : ''
                  }`}
                  onClick={() => setSelectedType(rt.id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{t(rt.tKey)}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-medium mb-2">{t('profile.lga')}</p>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={lga}
          onChange={e => setLga(e.target.value)}
        >
          {lgas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Camera / Media Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('report.camera')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Camera preview */}
          {mediaMode && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 object-cover"
              />
              <button
                onClick={stopMedia}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
              {mediaMode === 'photo' && (
                <Button
                  size="sm"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2"
                  onClick={capturePhoto}
                >
                  <Camera className="h-4 w-4 mr-1" /> {t('report.photo')}
                </Button>
              )}
              {mediaMode === 'video' && !isRecording && (
                <Button
                  size="sm"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2"
                  onClick={startRecording}
                >
                  <Video className="h-4 w-4 mr-1" /> {t('report.video')}
                </Button>
              )}
              {mediaMode === 'video' && isRecording && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2"
                  onClick={stopRecording}
                >
                  <Video className="h-4 w-4 mr-1" /> {t('report.live_stop')}
                </Button>
              )}
              {mediaMode === 'live' && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-red-600 animate-pulse">{t('report.live_active')}</Badge>
                </div>
              )}
            </div>
          )}

          {mediaError && (
            <p className="text-xs text-destructive">{mediaError}</p>
          )}

          {/* Captured media preview */}
          {capturedMedia && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              {capturedMedia.startsWith('data:image') ? (
                <img src={capturedMedia} alt="Captured" className="w-full h-40 object-cover" />
              ) : (
                <video src={capturedMedia} controls className="w-full h-40" />
              )}
              <button
                onClick={() => setCapturedMedia(null)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
                {capturedMedia.startsWith('data:image') ? t('report.captured_photo') : t('report.captured_video')}
              </p>
            </div>
          )}

          {/* Action buttons (hide when camera is active) */}
          {!mediaMode && !capturedMedia && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="flex-col gap-1 h-auto py-3" onClick={() => startCamera('photo')}>
                <Camera className="h-5 w-5" />
                <span className="text-[10px]">{t('report.photo')}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col gap-1 h-auto py-3" onClick={() => startCamera('video')}>
                <Video className="h-5 w-5" />
                <span className="text-[10px]">{t('report.video')}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col gap-1 h-auto py-3" onClick={() => startCamera('live')}>
                <Radio className="h-5 w-5" />
                <span className="text-[10px]">{t('report.live')}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-medium mb-2">{t('report.description')}</p>
        <Input
          placeholder={t('report.description')}
          value={description}
          onChange={e => e.target.value.length <= 200 && setDescription(e.target.value)}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{description.length}{t('report.char_count')}</p>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!selectedType || !lga}
        onClick={handleSubmit}
      >
        {t('report.submit')}
      </Button>
    </div>
  );
}
