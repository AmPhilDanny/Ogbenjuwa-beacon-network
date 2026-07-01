import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlert } from '@/contexts/AlertContext';

export function ActiveAlertBanner() {
  const { isActive, type, message, resolveAlert } = useAlert();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 bg-destructive/10 px-4 py-3 border-b border-destructive/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle className={`h-5 w-5 shrink-0 text-destructive ${type === 'sos' ? 'animate-pulse' : ''}`} />
              <div className="min-w-0">
                <span className="text-sm font-bold text-destructive">
                  {type === 'sos' ? 'EMERGENCY SOS ACTIVE' : 'ALERT ACTIVE'}
                </span>
                <span className="text-sm text-muted-foreground ml-2 truncate">{message}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={resolveAlert}
            >
              <X className="h-4 w-4" />
              Resolve
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
