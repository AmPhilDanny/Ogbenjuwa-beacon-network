import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface Props {
  onReportAnother: () => void;
}

export default function ReportConfirmation({ onReportAnother }: Props) {
  const { t } = useLanguage();
  return (
    <Card className="text-center">
      <CardContent className="py-12 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <div>
          <h2 className="text-xl font-bold">{t('report.success')}</h2>
          <p className="text-sm text-muted-foreground">{t('report.success_desc')}</p>
        </div>
        <Button onClick={onReportAnother}>{t('report.report_another')}</Button>
      </CardContent>
    </Card>
  );
}
