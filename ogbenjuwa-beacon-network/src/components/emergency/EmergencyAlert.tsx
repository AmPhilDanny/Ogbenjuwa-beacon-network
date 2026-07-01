import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Phone, X, Shield, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlert } from '@/contexts/AlertContext';

export function EmergencyAlert() {
  const { resolveAlert } = useAlert();
  const [status, setStatus] = useState<'notifying' | 'active'>('notifying');
  const [audio] = useState(new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'));

  useEffect(() => {
    audio.loop = true;
    audio.play().catch(e => console.log("Audio play blocked by browser", e));
    return () => audio.pause();
  }, [audio]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('active');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleResolve = () => {
    audio.pause();
    audio.currentTime = 0;
    resolveAlert();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/20 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border-destructive shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-destructive text-destructive-foreground py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 animate-pulse" />
                <CardTitle className="text-xl">EMERGENCY SOS ACTIVE</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handleResolve}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {status === 'notifying' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-destructive" />
                  <div>
                    <h3 className="text-lg font-bold">Notifying Emergency Responders</h3>
                    <p className="text-muted-foreground">Your location is being transmitted to Ward safety leads and local emergency services.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-lg bg-destructive/10 p-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-destructive/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-destructive">Current Location</p>
                      <p className="font-bold">Otukpo, Ward 1, Sector 2</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Help is on the way
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Local vigilantes and 3 nearby community members have been notified and are responding to your location.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10">
                      <Phone className="h-4 w-4" />
                      Call Police
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Call Ambulance
                    </Button>
                  </div>

                  <Button variant="destructive" className="w-full" onClick={handleResolve}>
                    I AM SAFE NOW - CANCEL ALERT
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
